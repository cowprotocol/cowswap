import { encodeFunctionData, erc20Abi, maxUint256, stringToHex } from 'viem'
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
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { ContractsSigningScheme } from '@cowprotocol/sdk-contracts-ts'
import { ICoWShedCall } from '@cowprotocol/sdk-cow-shed'

import { t } from '@lingui/core/macro'
import { captchaCanQuoteAtom } from 'entities/captcha/state/captchaCanQuoteAtom'
import { prodTradingSdk, QUOTE_SETTINGS } from 'tradingSdk/tradingSdk'

import {
  assertFactoryDeployed,
  getCowShedHooks,
  EOA_TWAP_ACCOUNT_PROXY_CONFIG,
  EOA_TWAP_SHED_FACTORY_OPTIONS,
} from 'modules/accountProxy'
import { ComposableCowContractData } from 'modules/advancedOrders'
import { GeneratePermitHook, IsTokenPermittableResult } from 'modules/permit'
import { shouldZeroApprove } from 'modules/zeroApproval'

import {
  ensureEoaTwapVaultRelayerApproval,
  EnsureEoaTwapVaultRelayerApprovalResult,
  getEoaTwapApprovalNeeds,
} from './ensureEoaTwapVaultRelayerApproval'

import { TwapOrderCreationContext } from '../../../hooks/useTwapOrderCreationContext'
import { EoaTwapSigningPhase, EoaTwapSigningSteps } from '../../../state/eoaTwapSigningStepAtom'
import { ConditionalOrderParams, TWAPOrder } from '../../../types'
import { getCreateTwapOrderCalldata } from '../../getTwapCreateCalldata'

import type { EoaTwapFlowUpdater } from '../../../hooks/useEoaTwapSigningStep'

const DEFAULT_GAS_LIMIT = 600_000n
const FUNDING_ORDER_VALID_FOR_SEC = 1800
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
  /** Initial buy sell=buy order permit info */
  permitInfo: IsTokenPermittableResult
  generatePermitHook: GeneratePermitHook
  onSigningStep: EoaTwapFlowUpdater
}

export interface PlaceEoaTwapOrderResult {
  orderPostingResult: OrderPostingResult
  proxyAddress: AccountAddress
}

/**
 * Builds cow-shed multicall that runs after the BUY sell=buy order as a post-hook:
 * - Optionally zero-approve the TWAP proxy (vault relayer)
 * - Optionally approve the TWAP proxy (vault relayer)
 * - Create the TWAP on ComposableCow (owner = shed).
 */
export function getEoaTwapOrderShedCalls({
  twapOrder,
  twapOrderCreationContext,
  paramsStruct,
  spender,
  proxyAllowances,
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
      // Must not allow failure: otherwise the sell=buy order can go through while create/approve is skipped, and funds get stuck in the proxy account.
      allowFailure: false,
    },
  ]

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
 * Places a sell=buy funding order (same TWAP sell token) with post-hooks that
 * approve the vault relayer (when needed) and create the TWAP on ComposableCow via cow-shed.
 * Cow-shed becomes the TWAP owner/trader; TWAP receiver remains the EOA.
 *
 * Expected call order (caller typically does step 0 first):
 * 1. (Optional) On-chain vault-relayer approve(maxUint256).
 * 2. Sign cow-shed EIP-712 (TwapSetup) encoding proxy approve + create TWAP post-hook.
 * 3. Quote funding BUY sell=buy order.
 * 4. Re-check EOA => vault-relayer allowance vs funding order sell. Re-request approval if short.
 * 5. Sign/post funding order (FundingOrder), then wait for settlement (CreatingOrder).
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
  permitInfo,
  generatePermitHook,
  onSigningStep,
}: PlaceEoaTwapOrderParams): Promise<PlaceEoaTwapOrderResult> {
  if (!twapOrderCreationContext || !signer) throw new Error('twapOrderCreationContext and signer are required')
  assertCaptchaCanQuote()

  const { sellAmount } = twapOrder
  const sellTokenAddress = sellAmount.currency.address as `0x${string}`
  const sellAmountAtoms = sellAmount.quotient

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

  // TODO: Do we need to show as unfillable orders where the TWAP proxy allowance is not enough, or can we assume that should never happen?

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
    `TWAP sell ${sellAmountFormatted} ${sellToken.symbol} for ${buyToken.symbol} in ${numOfParts} parts.
To create the TWAP we will use an intermediate sell=buy order with a post hook:
  - Buy ${sellAmountFormatted} ${sellToken.symbol} with ${sellToken.symbol}, sent to ${proxyAddress}
  - Post-hook will create the TWAP using cow-shed. Each part sells ${sellToken.symbol} for ${buyToken.symbol}`,
  )

  const proxyAllowances = await getProxyAllowances({
    config,
    sellAmount,
    proxyAddress,
    spender: vaultRelayerAddress,
  })

  const calls = getEoaTwapOrderShedCalls({
    twapOrder,
    twapOrderCreationContext,
    paramsStruct,
    spender: vaultRelayerAddress,
    proxyAllowances,
  })

  const deadline = BigInt(Math.ceil(Date.now() / 1000)) + BigInt(FUNDING_ORDER_VALID_FOR_SEC)

  // TODO: Revert to this once we switch from `getCowShedHooks` to `CowShedSdk.signCalls`, once it forwards a custom
  // EIP-712 version.
  /*
  const { signedMulticall, gasLimit } = await cowShedSdk.signCalls({
    chainId,
    calls,
    deadline,
    signer,
    defaultGasLimit: DEFAULT_GAS_LIMIT,
    // TODO: Could the estimation be too low for newly created sheds?
    // gasLimit: DEFAULT_GAS_LIMIT,
  })
  */

  const nonceHex = stringToHex(Date.now().toString()).slice(2)
  const nonce = `0x${(nonceHex + '0'.repeat(64)).slice(0, 64)}` as `0x${string}`
  onSigningStep({ step: EoaTwapSigningSteps.TwapSetup, phase: EoaTwapSigningPhase.Sign })
  const signature = await cowShedHooks.signCalls(calls, nonce, deadline, ContractsSigningScheme.EIP712, signer)
  onSigningStep({ step: EoaTwapSigningSteps.TwapSetup, phase: EoaTwapSigningPhase.Confirmed })
  const callData = cowShedHooks.encodeExecuteHooksForFactory(calls, nonce, deadline, account, signature)
  const signedMulticall = {
    to: factoryAddress,
    data: callData,
    value: 0n,
  }
  // TODO: Could estimation be too low for newly created sheds?
  const gasLimit = DEFAULT_GAS_LIMIT

  eoaTwapDebugLog('Signed multicall=', signedMulticall)

  // TODO: We might want to quote differently for Safe vs EOA TWAPs, and then send the quoteId here
  // to skip this getQuote call:

  // This sell=buy order's only purpose is to create the TWAP. We use a BUY sell=buy order so that the buy amount
  // we get (into the proxy account) matches the intended sell amount of the actual TWAP. So, solver will
  // compete to offer the best (lowest) sell amount for the TWAP, which at the very least = buy amount + gas costs.

  const approveAndCreateTwapPostHook = {
    target: signedMulticall.to,
    callData: signedMulticall.data,
    gasLimit: gasLimit.toString(),
    dappId: EOA_TWAP_SETUP_DAPP_ID,
  }

  // Using the regular `tradingSdk` will use the staging orderbook for barn backend env. Passing `env: 'prod'` and `settlementContractOverride` would work,
  // but `getQuote` will then mutate the shared OrderBookApi context, so the easiest solution is to use the prod-only `prodTradingSdk`.
  assertCaptchaCanQuote()

  const { quoteResults, postSwapOrderFromQuote } = await prodTradingSdk.getQuote(
    {
      kind: OrderKind.BUY,
      sellToken: sellToken.address,
      sellTokenDecimals: sellToken.decimals,
      buyToken: sellToken.address,
      buyTokenDecimals: sellToken.decimals,
      // BUY sell=buy order (buy) amount = TWAP sell amount:
      amount: sellAmountAtoms.toString(),
      receiver: proxyAddress,
      owner: account,
      partiallyFillable: false,
      validFor: FUNDING_ORDER_VALID_FOR_SEC,
      signer,
    },
    {
      ...QUOTE_SETTINGS,
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

  // ---------------------------------------------------------------------------
  // Funding-order size vs vault-relayer allowance
  // ---------------------------------------------------------------------------
  //
  // The BUY sell=buy funding quote sell amount can exceed the TWAP sell amount, as it includes costs/slippage.
  // We therefore check if the allowance covers the sell amount + small buffer. If it doesn't, and we need
  // to show the Approve step, we'll request unlimited approval (`maxUint256`). However, wallets may let
  // the user edit that amount.
  //
  // If they edit it and approving exactly the amount the intend to sell, the allowance will fall short
  // and a second approve request will be presented to the user in the FundingOrder step.

  const fundingSellAmountAtoms = quoteResults.amountsAndCosts.afterSlippage.sellAmount
  const fundingSellAmount = CurrencyAmount.fromRawAmount(sellToken, fundingSellAmountAtoms.toString())
  const fundingSellAmountFormatted = fundingSellAmount.toExact()

  eoaTwapDebugLog(
    `Your CoW Shed will get exactly ${sellAmountFormatted} ${sellToken.symbol} for at most ${fundingSellAmountFormatted} ${sellToken.symbol}. Then a TWAP will be created with each part selling ${sellToken.symbol} for ${buyToken.symbol}.`,
  )

  // Move UI to "Confirm order" before any top-up approve so we never rewind to ApproveOrPermit
  // (which would mark TwapSetup as upcoming again).
  onSigningStep({ step: EoaTwapSigningSteps.FundingOrder, phase: EoaTwapSigningPhase.Sign })

  let ensureResult: EnsureEoaTwapVaultRelayerApprovalResult = {
    usedPermit: false,
    permitData: null,
    promptedWallet: false,
  }

  const approvalNeeds = await getEoaTwapApprovalNeeds({
    config,
    account,
    sellTokenAddress,
    spender: vaultRelayerAddress,
    amountToCover: fundingSellAmountAtoms,
    amountToApprove: maxUint256,
  })

  if (approvalNeeds.needsApproval) {
    // Allowance is short of the funding sell (under-approved in wallet, stale max, etc.).
    // Top up on-chain while keeping the stepper on FundingOrder (map approve phases onto it).
    log.warn('EOA TWAP funding sell exceeds current vault-relayer allowance; prompting on-chain top-up approve', {
      fundingSellAmountAtoms: fundingSellAmountAtoms.toString(),
    })

    ensureResult = await ensureEoaTwapVaultRelayerApproval({
      config,
      chainId,
      account,
      sellTokenAddress,
      sellTokenName: sellToken.name,
      spender: vaultRelayerAddress,
      amountToCover: fundingSellAmountAtoms,
      amountToApprove: maxUint256,
      permitInfo,
      generatePermitHook,
      preferOnChainApprove: true,
      // Keep the stepper on FundingOrder instead of rewinding to ZeroApprove/ApproveOrPermit:
      step: EoaTwapSigningSteps.FundingOrder,
      onSigningStep,
      approvalNeeds,
    })
  }

  // Receipt/log validation in `ensureEoaTwapVaultRelayerApproval` only proves what the approve tx set. We re-read
  // current allowance before funding EIP-712 in case another tab/device (or prior order) may have consumed the
  // allowance, and the Vault Relayer allowance is still below the funding order sell amount.

  onSigningStep({ step: EoaTwapSigningSteps.FundingOrder, phase: EoaTwapSigningPhase.Verifying })

  const { needsApproval: stillNeedsFundingAllowance } = await getEoaTwapApprovalNeeds({
    config,
    account,
    sellTokenAddress,
    spender: vaultRelayerAddress,
    amountToCover: fundingSellAmountAtoms,
    amountToApprove: maxUint256,
  })

  if (stillNeedsFundingAllowance) {
    throw new Error(t`Approved amount is not sufficient!`)
  }

  // Ready for the funding-order EIP-712 signature. Past this point the pending UI hides dismiss.
  onSigningStep({ step: EoaTwapSigningSteps.FundingOrder, phase: EoaTwapSigningPhase.Sign, lockDismiss: true })

  assertCaptchaCanQuote()

  let orderPostingResult: OrderPostingResult

  if (ensureResult.usedPermit && ensureResult.permitData) {
    orderPostingResult = await postSwapOrderFromQuote({
      appData: {
        metadata: {
          hooks: {
            // mergeAppDataDoc clears hooks when overriding, so we need to pass both pre (permit) and post (TWAP setup) hooks:
            pre: [ensureResult.permitData],
            post: [approveAndCreateTwapPostHook],
          },
        },
      },
    })
  } else {
    orderPostingResult = await postSwapOrderFromQuote()
  }

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

function assertCaptchaCanQuote(): void {
  if (!jotaiStore.get(captchaCanQuoteAtom)) throw new Error('Complete the CAPTCHA before you request a quote')
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
