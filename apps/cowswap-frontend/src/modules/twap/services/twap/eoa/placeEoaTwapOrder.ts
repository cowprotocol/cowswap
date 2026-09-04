import { encodeFunctionData, erc20Abi, maxUint256, stringToHex, type Hex, type WalletClient } from 'viem'
import type { Config } from 'wagmi'
import { readContract } from 'wagmi/actions'

import {
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD,
  createCowLogger,
  isProdLike,
  normalizeError,
} from '@cowprotocol/common-utils'
import { AccountAddress, SignerLike, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { PermitHookData } from '@cowprotocol/permit-utils'
import { ContractsSigningScheme } from '@cowprotocol/sdk-contracts-ts'
import { ICoWShedCall } from '@cowprotocol/sdk-cow-shed'

import { t } from '@lingui/core/macro'

import {
  assertFactoryDeployed,
  getCowShedHooks,
  EOA_TWAP_ACCOUNT_PROXY_CONFIG,
  EOA_TWAP_SHED_FACTORY_OPTIONS,
} from 'modules/accountProxy'
import { shouldZeroApprove } from 'modules/zeroApproval'

import { TransactionNotBroadcastError } from 'common/hooks/useGetReceipt'

import { waitForEoaTwapTxReceipt } from './waitForEoaTwapTxReceipt.utils'

import {
  COMPOSABLE_COW_POLLER_ADDRESS,
  COMPOSABLE_COW_POLLER_INITIAL_AUTH_EPOCH,
} from '../../../composable-cow-poller/composable-cow-poller.constants'
import { encodeRegisterFromShedCalldata } from '../../../composable-cow-poller/composable-cow-poller.utils'
import { TwapOrderCreationContext } from '../../../hooks/useTwapOrderCreationContext'
import { EoaTwapSigningPhase, EoaTwapSigningSteps } from '../../../state/eoaTwapSigningStepAtom'
import { ConditionalOrderParams, TWAPOrder } from '../../../types'
import { assertTwapOrderSalt } from '../../../utils/buildTwapOrderParamsStruct'
import { getCreateTwapOrderCalldata } from '../../getTwapCreateCalldata'

import type { ComposableCowPollerSchedule } from '../../../composable-cow-poller/composable-cow-poller.types'
import type { EoaTwapFlowUpdater } from '../../../hooks/useEoaTwapSigningStep'

const DEFAULT_GAS_LIMIT = 1_000_000n
const SETUP_VALID_FOR_SEC = 1800
const log = createCowLogger('EOA TWAP')

/**
 * Enable EOA TWAP POC debug logging. Enabled until this is released to prod.
 */
const EOA_TWAP_POC_DEBUG = true

export interface GetEoaTwapOrderShedCallsParams {
  twapOrder: TWAPOrder
  twapOrderCreationContext: TwapOrderCreationContext
  paramsStruct: ConditionalOrderParams
  spender: AccountAddress
  proxyAllowances: {
    needsApproval: boolean
    needsZeroApproval: boolean
  }

  /** When set, embeds `registerFromShed` before createWithContext in the cow-shed multicall. */
  pollerRegistration?: {
    pollerAddress: AccountAddress
    schedule: ComposableCowPollerSchedule
  }

  /**
   * Optional EOA => Poller permit hook to execute from the shed.
   * Used when the token supports permit so we can avoid a separate on-chain approve TX.
   */
  pollerPermitData?: PermitHookData | null
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
  walletClient: WalletClient
  onSigningStep: EoaTwapFlowUpdater
  pollerPermitData?: PermitHookData | null
}

export interface PlaceEoaTwapOrderResult {
  proxyAddress: AccountAddress
  setupTxHash: Hex
}

/**
 * Builds cow-shed multicall executed as a direct factory transaction:
 * - Optionally submit EOA => Poller permit calldata
 * - Register the JIT poller schedule via `registerFromShed`
 * - Optionally zero-approve the TWAP proxy (shed => vault relayer)
 * - Optionally approve the TWAP proxy (shed =>vault relayer)
 * - Create the TWAP on ComposableCow (owner = shed)
 */
// eslint-disable-next-line max-lines-per-function
export function getEoaTwapOrderShedCalls({
  twapOrder,
  twapOrderCreationContext,
  paramsStruct,
  spender,
  proxyAllowances,
  pollerRegistration,
  pollerPermitData = null,
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
      // Must not allow failure: otherwise register/approve can succeed while create is skipped.
      allowFailure: false,
    },
  ]

  if (needsApproval) {
    // Shed => Vault Relayer approve so settlement can pull each part's sell from the shed after
    // pollFunds deposits it (independent of EOA => Poller permit/approve):
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

  if (pollerRegistration) {
    // Register the JIT poller schedule so each TWAP part can pull funds from the EOA:
    const registerTx: ICoWShedCall = {
      target: pollerRegistration.pollerAddress,
      callData: encodeRegisterFromShedCalldata(pollerRegistration.schedule),
      value: 0n,
      isDelegateCall: false,
      allowFailure: false,
    }

    txs.unshift(registerTx)
  }

  if (pollerPermitData) {
    // EOA => Poller EIP-2612 permit so JIT pollFunds can pull sell tokens from the EOA
    // without a separate on-chain approve TX (does not replace shed => Vault Relayer approve above):
    const permitTx: ICoWShedCall = {
      target: pollerPermitData.target,
      callData: pollerPermitData.callData,
      value: 0n,
      isDelegateCall: false,
      allowFailure: false,
    }

    txs.unshift(permitTx)
  }

  return txs
}

/**
 * Places an EOA TWAP with JIT funding via ComposableCowPoller `registerFromShed`.
 *
 * Capital stays on the EOA. Setup is a single cow-shed factory transaction.
 *
 * For full placement flow see `buildEoaTwapSigningStepPlan`. Note the caller runs pre-steps before this function
 * (permit / zero-approve / approve):
 *
 * - Prefer EIP-2612 permit (`PermitPoller`). We pass `pollerPermitData` so allowance is applied in the setup multicall.
 * - Otherwise on-chain EOA => VaultRelayer zero-approve / approve (`ZeroApprovePoller`, `ApprovePoller`).
 *
 * After that:
 * 1. Sign cow-shed EIP-712.
 * 2. Send factory executeHooks TX and wait for mining.
 * 3. Mark CreatingOrder confirmed (setup receipt is already mined).
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
  walletClient,
  onSigningStep,
  pollerPermitData = null,
}: PlaceEoaTwapOrderParams): Promise<PlaceEoaTwapOrderResult> {
  if (!twapOrderCreationContext || !signer) throw new Error('twapOrderCreationContext and signer are required')

  const { sellAmount } = twapOrder

  /**
   * TWAP for EOA is prod-only:
   * - WatchTower creates part orders on prod.
   * - AppData is uploaded to prod.
   * - Proxy approvals target the production Vault Relayer.
   *
   * So we always use the PROD Vault Relayer address as `spender`. If we support other envs in the future, we can use `twapOrderCreationContext.spender`
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

  // Define trade parameters:
  const { buyAmount, numOfParts } = twapOrder
  const sellToken = sellAmount.currency
  const buyToken = buyAmount.currency
  const sellAmountFormatted = sellAmount.toExact()

  eoaTwapDebugLog(
    `TWAP sell ${sellAmountFormatted} ${sellToken.symbol} for ${buyToken.symbol} in ${numOfParts} parts (JIT)`,
  )

  const proxyAllowances = await getProxyAllowances({
    config,
    sellAmount,
    proxyAddress,
    spender: vaultRelayerAddress,
  })

  const schedule: ComposableCowPollerSchedule = {
    handler: paramsStruct.handler as AccountAddress,
    authEpoch: COMPOSABLE_COW_POLLER_INITIAL_AUTH_EPOCH,
    funder: account,
    owner: proxyAddress,
    salt: assertTwapOrderSalt(paramsStruct.salt),
    staticInput: paramsStruct.staticInput as Hex,
  }

  const calls = getEoaTwapOrderShedCalls({
    twapOrder,
    twapOrderCreationContext,
    paramsStruct,
    spender: vaultRelayerAddress,
    proxyAllowances,
    pollerRegistration: {
      pollerAddress,
      schedule,
    },
    pollerPermitData,
  })

  const deadline = BigInt(Math.ceil(Date.now() / 1000)) + BigInt(SETUP_VALID_FOR_SEC)

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

  const callData = cowShedHooks.encodeExecuteHooksForFactory(calls, nonce, deadline, account, signature)

  eoaTwapDebugLog('Signed setup multicall', { to: factoryAddress, callData })

  onSigningStep({
    step: EoaTwapSigningSteps.TwapSetup,
    phase: EoaTwapSigningPhase.WaitingForTx,
    lockDismiss: true,
  })

  const setupTxHash = await walletClient.sendTransaction({
    to: factoryAddress,
    data: callData as Hex,
    account,
    chain: walletClient.chain,
    gas: DEFAULT_GAS_LIMIT,
  })

  eoaTwapDebugLog('Setup tx submitted', setupTxHash)

  const receipt = await waitForEoaTwapTxReceipt(config, setupTxHash, chainId).catch((err: unknown) => {
    const error = normalizeError(err)

    if (error instanceof TransactionNotBroadcastError) {
      throw new Error(t`TWAP setup was cancelled or not broadcast. Please try again.`)
    }

    throw error
  })

  if (receipt.status !== 'success') {
    throw new Error('TWAP setup transaction reverted')
  }

  onSigningStep({ step: EoaTwapSigningSteps.TwapSetup, phase: EoaTwapSigningPhase.Confirmed })
  // Setup receipt is already mined; skip CreatingOrder WaitingForTx to avoid a UI flicker.
  onSigningStep({ step: EoaTwapSigningSteps.CreatingOrder, phase: EoaTwapSigningPhase.Confirmed })

  return { proxyAddress, setupTxHash }
}

function eoaTwapDebugLog(...args: unknown[]): void {
  if (!EOA_TWAP_POC_DEBUG) return

  log.debug(...args)
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
    // Include approve so the setup multicall still sets it up if there's any kind of issue:
    return 0n
  })

  const needsApproval = proxyAllowance < BigInt(sellAmountAtoms.toString())

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
