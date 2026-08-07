import { encodeFunctionData, erc20Abi, maxUint256, stringToHex, type Hex } from 'viem'
import type { Config } from 'wagmi'
import { readContract } from 'wagmi/actions'

import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD, createCowLogger, isProdLike } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import {
  AccountAddress,
  OrderKind,
  OrderPostingResult,
  QuoteResults,
  SignerLike,
  SupportedChainId,
} from '@cowprotocol/cow-sdk'
import { ComposableCowPollerAbi } from '@cowprotocol/cowswap-abis'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { PermitHookData } from '@cowprotocol/permit-utils'
import { ContractsSigningScheme } from '@cowprotocol/sdk-contracts-ts'
import { ICoWShedCall } from '@cowprotocol/sdk-cow-shed'

import { t } from '@lingui/core/macro'
import { captchaCanQuoteAtom } from 'entities/captcha/state/captchaCanQuoteAtom'
import { prodTradingSdk } from 'tradingSdk/tradingSdk'

import {
  assertFactoryDeployed,
  getCowShedHooks,
  EOA_TWAP_ACCOUNT_PROXY_CONFIG,
  EOA_TWAP_SHED_FACTORY_OPTIONS,
} from 'modules/accountProxy'
import { ComposableCowContractData } from 'modules/advancedOrders'
import { shouldZeroApprove } from 'modules/zeroApproval'

import { ensureEoaTwapSpenderAllowance, getEoaTwapApprovalNeeds } from './ensureEoaTwapSpenderAllowance'

import {
  COMPOSABLE_COW_POLLER_ADDRESS,
  ComposableCowPollerSchedule,
} from '../../../composable-cow-poller/composable-cow-poller.constants'
import {
  encodeRegisterWithSignatureCalldata,
  getComposableCowPollerRegisterTypedData,
  toSignTypedDataArgs,
} from '../../../composable-cow-poller/composable-cow-poller.utils'
import { TwapOrderCreationContext } from '../../../hooks/useTwapOrderCreationContext'
import { EoaTwapSigningPhase, EoaTwapSigningSteps } from '../../../state/eoaTwapSigningStepAtom'
import { ConditionalOrderParams, TWAPOrder } from '../../../types'
import { EOA_TWAP_SETUP_BUY_AMOUNT_ATOMS } from '../../../utils/getEoaTwapPrePlacementAmountToCover'
import { getCreateTwapOrderCalldata } from '../../getTwapCreateCalldata'

import type { EoaTwapFlowUpdater } from '../../../hooks/useEoaTwapSigningStep'

const DEFAULT_GAS_LIMIT = 600_000n
const FUNDING_ORDER_VALID_FOR_SEC = 1800
const REGISTER_SIGNATURE_VALID_FOR_SEC = 1800
const log = createCowLogger('EOA TWAP')
const EOA_TWAP_POC_DEBUG = true

// TODO: Move to `@cowprotocol/cow-sdk` just like `import { PERMIT_HOOK_DAPP_ID } from '@cowprotocol/hook-dapp-lib'`?
const EOA_TWAP_SETUP_DAPP_ID = 'cowswap://twap/eoa-setup' // cow-sdk-scripts://composable-cow/post-twap-for-eoa

// TODO: Why is this using a Uniswap v4 contract in Anxos POC (See apps/cowswap-frontend/src/pages/error/AnySwapAffectedUsers/useIsAnySwapAffectedUser.ts)?
// export const COW_VAULT_RELAYER_CONTRACT = "0xC92E8bdf79f0507f65a392b0ab4667716BFE0110";

export interface GetEoaTwapOrderShedCallsParams {
  twapOrder: TWAPOrder
  twapOrderCreationContext: TwapOrderCreationContext
  paramsStruct: ConditionalOrderParams
  spender: AccountAddress
  proxyAllowances: {
    needsApproval: boolean
    needsZeroApproval: boolean
  }
  /** When set, embeds registerWithSignature before createWithContext in the cow-shed multicall. */
  pollerRegistration?: {
    pollerAddress: AccountAddress
    schedule: ComposableCowPollerSchedule
    deadline: bigint
    signature: Hex
  }
}

export interface GetProxyAllowancesParams {
  config: Config
  sellAmount: CurrencyAmount<Token>
  proxyAddress: AccountAddress
  spender: AccountAddress
}

export interface GetProxyAllowancesResult {
  needsApproval: boolean
  needsZeroApproval: boolean
}

export interface PlaceEoaTwapOrderParams {
  chainId: SupportedChainId
  account: AccountAddress
  twapOrder: TWAPOrder
  twapOrderCreationContext: null | TwapOrderCreationContext
  paramsStruct: ConditionalOrderParams
  signer: SignerLike
  config: Config
  composableCowContract: ComposableCowContractData
  onSigningStep: EoaTwapFlowUpdater
  /** Optional poller permit to attach as a sell=buy pre-hook (Vault Relayer always uses on-chain approve). */
  pollerPermitData?: PermitHookData | null
}

export interface PlaceEoaTwapOrderResult {
  orderPostingResult: OrderPostingResult
  proxyAddress: AccountAddress
}

/**
 * Builds cow-shed multicall that runs after the setup sell=buy order as a post-hook:
 * - Optionally zero-approve / approve the TWAP proxy (vault relayer) for part sells
 * - Optionally register the JIT poller schedule via registerWithSignature
 * - Create the TWAP on ComposableCow (owner = shed)
 */
export function getEoaTwapOrderShedCalls({
  twapOrder,
  twapOrderCreationContext,
  paramsStruct,
  spender,
  proxyAllowances,
  pollerRegistration,
}: GetEoaTwapOrderShedCallsParams): ICoWShedCall[] {
  // Note: `twapOrderCreationContext.needsApproval` and `twapOrderCreationContext.needsZeroApproval` refer to the
  // connected wallet (EOA/Safe), not to the proxy account. DO NOT USE THEM HERE.
  //
  // Also, `twapOrderCreationContext.spender` follows the current app env (prod vs staging) via
  // `useTradeSpenderAddress`. Use the `spender` parameter instead, which is always the PROD Vault Relayer address.

  const { composableCowContract, currentBlockFactoryAddress } = twapOrderCreationContext

  if (!currentBlockFactoryAddress) {
    throw new Error('currentBlockFactoryAddress is required to create a TWAP order')
  }

  const { needsApproval, needsZeroApproval } = proxyAllowances

  eoaTwapDebugLog('EOA approvals', twapOrderCreationContext.needsApproval, twapOrderCreationContext.needsZeroApproval)
  eoaTwapDebugLog('Proxy approvals', { needsApproval, needsZeroApproval })

  const { sellAmount } = twapOrder
  const sellTokenAddress = sellAmount.currency.address
  const sellAmountAtoms = maxUint256

  // At the very least, we need the create order tx:
  const txs: ICoWShedCall[] = [
    {
      target: composableCowContract.address,
      callData: getCreateTwapOrderCalldata({
        composableCowContractAbi: composableCowContract.abi,
        paramsStruct,
        currentBlockFactoryAddress,
      }),
      value: 0n,
      isDelegateCall: false,
      // Must not allow failure: otherwise the sell=buy order can go through while create/approve is skipped.
      allowFailure: false,
    },
  ]

  if (pollerRegistration) {
    const registerTx: ICoWShedCall = {
      target: pollerRegistration.pollerAddress,
      callData: encodeRegisterWithSignatureCalldata(
        pollerRegistration.schedule,
        pollerRegistration.deadline,
        pollerRegistration.signature,
      ),
      value: 0n,
      isDelegateCall: false,
      allowFailure: false,
    }

    txs.unshift(registerTx)
  }

  if (needsApproval) {
    // If we need to approve the sell token, we need to add the approve tx first:
    const approveTx: ICoWShedCall = {
      target: sellTokenAddress,
      callData: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [spender, sellAmountAtoms],
      }),
      value: 0n,
      isDelegateCall: false,
      allowFailure: false,
    }

    txs.unshift(approveTx)
  }

  if (needsZeroApproval) {
    // Some USDT-style tokens require resetting the allowance to zero before we set a new allowance:
    const zeroApproveTx: ICoWShedCall = {
      target: sellTokenAddress,
      callData: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [spender as `0x${string}`, 0n],
      }),
      value: 0n,
      isDelegateCall: false,
      allowFailure: false,
    }

    txs.unshift(zeroApproveTx)
  }

  return txs
}

/**
 * Places a minimal BUY sell=buy setup order (same TWAP sell token) with post-hooks that
 * register the JIT poller schedule (registerWithSignature), approve the vault relayer when needed,
 * and create the TWAP on ComposableCow via cow-shed.
 *
 * Cow-shed becomes the TWAP owner/trader, while TWAP receiver remains the EOA (or recipient, if set).
 *
 * Capital stays on the EOA. Each TWAP part pulls via pollFunds pre-hook in TWAP appData.
 *
 * Expected call order:
 *
 * 0. Caller (before this function):
 *    1. EOA => Vault Relayer on-chain approve when needed.
 *    2. Then EOA => ComposableCowPoller permit (preferred, `pollerPermitData`) or on-chain approve for the full TWAP sell.
 * 1. Sign EIP-712 registerWithSignature, then cow-shed EIP-712 (TwapSetup).
 * 2. Quote dust BUY sell=buy order.
 * 3. Re-check EOA => vault-relayer allowance vs setup sell. Re-request on-chain approval if short.
 * 4. Sign/post setup order (FundingOrder), attaching `pollerPermitData` as a pre-hook when present,
 *    then wait for settlement (CreatingOrder).
 */
// eslint-disable-next-line max-lines-per-function
export async function placeEoaTwapOrder({
  chainId,
  account,
  twapOrder,
  twapOrderCreationContext,
  paramsStruct,
  signer,
  config,
  onSigningStep,
  pollerPermitData = null,
}: PlaceEoaTwapOrderParams): Promise<PlaceEoaTwapOrderResult> {
  if (!twapOrderCreationContext || !signer) throw new Error('twapOrderCreationContext and signer are required')
  assertCaptchaCanQuote()

  const { sellAmount } = twapOrder
  const sellTokenAddress = sellAmount.currency.address as `0x${string}`

  /**
   * TWAP for EOA is prod-only:
   * - WatchTower creates part orders on prod.
   * - AppData is uploaded to prod.
   * - Both the funding sell=buy order and proxy approvals target the production Vault Relayer.
   *
   * So we will always use the PROD Vault Relayer address as `spender`. If we support other envs in the future, we can use `twapOrderCreationContext.spender`
   * instead, which follows the current app env (prod vs staging) via `useTradeSpenderAddress`.
   * @see https://github.com/anxolin/cow-sdk-scripts/pull/12
   */
  const vaultRelayerAddress = COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD[chainId]

  if (!vaultRelayerAddress) {
    throw new Error(`Vault relayer address is not configured for chain ${chainId}`)
  }

  const pollerAddress = COMPOSABLE_COW_POLLER_ADDRESS[chainId]

  if (!pollerAddress) {
    throw new Error(`ComposableCowPoller is not deployed on chain ${chainId}`)
  }

  // TODO: This could be simplified by using `CowShedSdk` instead of `CowShedHooks`, but right now it does not support passing a custom version, and it defaults
  // to 1.0.1, so signature verification will fail.
  const cowShedHooks = getCowShedHooks({ chainId, accountProxyConfig: EOA_TWAP_ACCOUNT_PROXY_CONFIG })
  const factoryAddress = EOA_TWAP_SHED_FACTORY_OPTIONS.factoryAddress as `0x${string}`

  // `proxyAddress` (quote receiver) is a special shed with support for Composable Cow. See https://github.com/cowdao-grants/cow-shed/pull/53
  const proxyAddress = cowShedHooks.proxyOf(account) as AccountAddress

  // Check if the factory is deployed (skip in prod-like envs):

  if (!isProdLike) {
    await assertFactoryDeployed(config, factoryAddress, `chain ${chainId}`)
  }

  eoaTwapDebugLog('CowShed account:', proxyAddress)

  // Define trade parameters
  const { buyAmount, numOfParts } = twapOrder
  const sellToken = sellAmount.currency
  const buyToken = buyAmount.currency
  const sellAmountFormatted = sellAmount.toExact()

  eoaTwapDebugLog(
    `TWAP sell ${sellAmountFormatted} ${sellToken.symbol} for ${buyToken.symbol} in ${numOfParts} parts (JIT). Setup uses a 1 atom + costs and fees BUY sell=buy.`,
  )

  const proxyAllowances = await getProxyAllowances({
    config,
    sellAmount,
    proxyAddress,
    spender: vaultRelayerAddress,
  })

  const schedule: ComposableCowPollerSchedule = {
    handler: paramsStruct.handler as AccountAddress,
    funder: account,
    owner: proxyAddress,
    salt: paramsStruct.salt as Hex,
    staticInput: paramsStruct.staticInput as Hex,
  }

  const registerDeadline = BigInt(Math.ceil(Date.now() / 1000)) + BigInt(REGISTER_SIGNATURE_VALID_FOR_SEC)
  const nonce = await readContract(config, {
    address: pollerAddress,
    abi: ComposableCowPollerAbi,
    functionName: 'nonces',
    args: [account],
  })

  const registerTypedData = getComposableCowPollerRegisterTypedData({
    chainId,
    pollerAddress,
    schedule,
    nonce,
    deadline: registerDeadline,
  })

  onSigningStep({ step: EoaTwapSigningSteps.TwapSetup, phase: EoaTwapSigningPhase.Sign })

  const typedDataSigner = asTypedDataSigner(signer)

  const registerSignature = await typedDataSigner.signTypedData(...toSignTypedDataArgs(registerTypedData))

  const calls = getEoaTwapOrderShedCalls({
    twapOrder,
    twapOrderCreationContext,
    paramsStruct,
    spender: vaultRelayerAddress,
    proxyAllowances,
    pollerRegistration: {
      pollerAddress,
      schedule,
      deadline: registerDeadline,
      signature: registerSignature as Hex,
    },
  })

  const deadline = BigInt(Math.ceil(Date.now() / 1000)) + BigInt(FUNDING_ORDER_VALID_FOR_SEC)
  const nonceHex = stringToHex(Date.now().toString()).slice(2)
  const cowShedNonce = `0x${(nonceHex + '0'.repeat(64)).slice(0, 64)}` as `0x${string}`
  const signature = await cowShedHooks.signCalls(calls, cowShedNonce, deadline, ContractsSigningScheme.EIP712, signer)

  onSigningStep({ step: EoaTwapSigningSteps.TwapSetup, phase: EoaTwapSigningPhase.Confirmed })

  const callData = cowShedHooks.encodeExecuteHooksForFactory(calls, cowShedNonce, deadline, account, signature)
  const signedMulticall = {
    to: factoryAddress,
    data: callData,
    value: 0n,
  }

  // TODO: Could estimation be too low for newly created sheds?
  const gasLimit = DEFAULT_GAS_LIMIT

  eoaTwapDebugLog('Signed multicall=', signedMulticall)

  // This sell=buy order's only purpose is to create the TWAP. We use a 1 atom BUY sell=buy order so that the buy
  // amount we get (into the proxy account) matches the intended sell amount of the actual TWAP. So, solver will
  // compete to offer the best (lowest) sell amount for the TWAP, which ~= 1 atom + gas costs + fees.

  const approveAndCreateTwapPostHook = {
    target: signedMulticall.to,
    callData: signedMulticall.data,
    gasLimit: gasLimit.toString(),
    dappId: EOA_TWAP_SETUP_DAPP_ID,
  }

  assertCaptchaCanQuote()

  // Using the regular `tradingSdk` will use the staging orderbook for barn backend env. Passing `env: 'prod'` and `settlementContractOverride` would work,
  // but `getQuote` will then mutate the shared OrderBookApi context, so the easiest solution is to use the prod-only `prodTradingSdk`.
  const { quoteResults, postSwapOrderFromQuote } = await prodTradingSdk.getQuote(
    {
      kind: OrderKind.BUY,
      sellToken: sellToken.address,
      sellTokenDecimals: sellToken.decimals,
      buyToken: sellToken.address,
      buyTokenDecimals: sellToken.decimals,
      // BUY sell=buy order (buy) amount = 1 atom:
      amount: EOA_TWAP_SETUP_BUY_AMOUNT_ATOMS.toString(),
      receiver: account,
      owner: account,
      partiallyFillable: false,
      validFor: FUNDING_ORDER_VALID_FOR_SEC,
      signer,
    },
    {
      appData: {
        metadata: {
          hooks: {
            post: [approveAndCreateTwapPostHook],
          },
        },
      },
    },
  )

  printQuote(quoteResults)

  const setupSellAmountAtoms = quoteResults.amountsAndCosts.afterSlippage.sellAmount
  const setupSellAmount = CurrencyAmount.fromRawAmount(sellToken, setupSellAmountAtoms.toString())

  eoaTwapDebugLog(
    `Setup sell=buy buys ${EOA_TWAP_SETUP_BUY_AMOUNT_ATOMS.toString()} wei ${sellToken.symbol} for at most ${setupSellAmount.toExact()} ${sellToken.symbol}. TWAP capital stays on the EOA.`,
  )

  // Move UI to "Confirm order" before any top-up approve so we never rewind to ApproveOrPermit
  // (which would mark TwapSetup as upcoming again).
  onSigningStep({ step: EoaTwapSigningSteps.FundingOrder, phase: EoaTwapSigningPhase.Sign })

  const approvalNeeds = await getEoaTwapApprovalNeeds({
    config,
    account,
    sellTokenAddress,
    spender: vaultRelayerAddress,
    amountToCover: setupSellAmountAtoms,
    amountToApprove: maxUint256,
  })

  if (approvalNeeds.needsApproval) {
    log.warn('EOA TWAP setup sell exceeds current vault-relayer allowance. Prompting on-chain top-up approve...', {
      setupSellAmountAtoms: setupSellAmountAtoms.toString(),
    })

    // Vault Relayer never uses permit (no permit args): setup sell size is only known after the quote.
    await ensureEoaTwapSpenderAllowance({
      config,
      chainId,
      account,
      sellTokenAddress,
      sellTokenName: sellToken.name,
      spender: vaultRelayerAddress,
      amountToCover: setupSellAmountAtoms,
      amountToApprove: maxUint256,
      // Keep the stepper on FundingOrder instead of rewinding to ZeroApprove/Approve:
      step: EoaTwapSigningSteps.FundingOrder,
      onSigningStep,
      approvalNeeds,
    })
  }

  onSigningStep({ step: EoaTwapSigningSteps.FundingOrder, phase: EoaTwapSigningPhase.Verifying })

  // Receipt/log validation in `ensureEoaTwapSpenderAllowance` only proves what the approve tx set. We re-read
  // current allowance before funding EIP-712 in case another tab/device (or prior order) may have consumed the
  // allowance, and the Vault Relayer allowance is still below the funding order sell amount.

  const { needsApproval: stillNeedsSetupAllowance } = await getEoaTwapApprovalNeeds({
    config,
    account,
    sellTokenAddress,
    spender: vaultRelayerAddress,
    amountToCover: setupSellAmountAtoms,
    amountToApprove: maxUint256,
  })

  if (stillNeedsSetupAllowance) {
    throw new Error(t`Approved amount is not sufficient!`)
  }

  // Ready for the funding-order EIP-712 signature. Past this point the pending UI hides dismiss.
  onSigningStep({ step: EoaTwapSigningSteps.FundingOrder, phase: EoaTwapSigningPhase.Sign, lockDismiss: true })

  assertCaptchaCanQuote()

  const orderPostingResult = await postSwapOrderFromQuote(
    pollerPermitData
      ? {
          appData: {
            metadata: {
              hooks: {
                // mergeAppDataDoc clears hooks when overriding, so we need to pass both pre (permit) and post (TWAP setup) hooks:
                pre: [pollerPermitData],
                post: [approveAndCreateTwapPostHook],
              },
            },
          },
        }
      : undefined,
  )

  onSigningStep({ step: EoaTwapSigningSteps.FundingOrder, phase: EoaTwapSigningPhase.Confirmed })

  onSigningStep({ step: EoaTwapSigningSteps.CreatingOrder, phase: EoaTwapSigningPhase.WaitingForTx })

  return { orderPostingResult, proxyAddress }
}

async function getProxyAllowances({
  config,
  sellAmount,
  proxyAddress,
  spender,
}: GetProxyAllowancesParams): Promise<GetProxyAllowancesResult> {
  const sellTokenAddress = sellAmount.currency.address
  const sellAmountAtoms = sellAmount.quotient

  const proxyAllowance = await readContract(config, {
    address: sellTokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [proxyAddress, spender],
  }).catch(() => {
    // Include approve so the post-hook still sets it up if there's any kind of issue:
    return 0n
  })

  const needsApproval = proxyAllowance < sellAmountAtoms

  const needsZeroApproval = needsApproval
    ? await shouldZeroApprove({
        tokenAddress: sellTokenAddress,
        // TODO: Verify this works properly
        owner: proxyAddress as `0x${string}`,
        spender: spender,
        amountToApprove: sellAmount,
        forceApprove: true,
        config,
      }).then((result) => result ?? false)
    : false

  return {
    needsApproval,
    needsZeroApproval,
  }
}

export const jsonReplacer = (_key: string, value: unknown): unknown => {
  // Handle BigInt
  if (typeof value === 'bigint') {
    return value.toString()
  }
  // Handle BigNumber (if you're using ethers.BigNumber)
  if (
    typeof value === 'object' &&
    value !== null &&
    '_isBigNumber' in value &&
    (value as { _isBigNumber?: boolean })._isBigNumber
  ) {
    return String(value)
  }
  return value
}

type TypedDataSigner = {
  signTypedData: (domain: unknown, types: unknown, value: Record<string, unknown>) => Promise<string>
}

function assertCaptchaCanQuote(): void {
  if (!jotaiStore.get(captchaCanQuoteAtom)) throw new Error('Complete the CAPTCHA before you request a quote')
}

/** SignerLike = PrivateKey | Signer; PrivateKey is a string so `in` must not run on primitives. */
function asTypedDataSigner(signer: SignerLike): TypedDataSigner {
  if (typeof signer !== 'object' || signer === null) {
    throw new Error('Signer does not support signTypedData required for registerWithSignature')
  }

  const candidate = signer as { signTypedData?: unknown }

  if (typeof candidate.signTypedData !== 'function') {
    throw new Error('Signer does not support signTypedData required for registerWithSignature')
  }

  return candidate as TypedDataSigner
}

function eoaTwapDebugLog(...args: unknown[]): void {
  if (!EOA_TWAP_POC_DEBUG) return

  log.debug(...args)
}

function printQuote(quoteResults: QuoteResults): void {
  if (!EOA_TWAP_POC_DEBUG) return

  eoaTwapDebugLog(`Suggested slippage: ${quoteResults.suggestedSlippageBps}`)
  eoaTwapDebugLog('Quote:', JSON.stringify(quoteResults.quoteResponse, jsonReplacer, 2))
  eoaTwapDebugLog('Amounts and costs:', JSON.stringify(quoteResults.amountsAndCosts, jsonReplacer, 2))
  eoaTwapDebugLog('App Data:', JSON.stringify(quoteResults.appDataInfo, jsonReplacer, 2))
  eoaTwapDebugLog('Order to sign:', JSON.stringify(quoteResults.orderToSign, jsonReplacer, 2))
  eoaTwapDebugLog('Order Typed Data:', JSON.stringify(quoteResults.orderTypedData, jsonReplacer, 2))
}
