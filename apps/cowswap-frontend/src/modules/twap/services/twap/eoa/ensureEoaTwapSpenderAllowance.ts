import { type Address, type Hex, erc20Abi } from 'viem'
import type { Config } from 'wagmi'
import { getPublicClient, getTransaction, getTransactionReceipt, readContract, writeContract } from 'wagmi/actions'

import { calculateGasMargin, createCowLogger, delay } from '@cowprotocol/common-utils'
import { AccountAddress, isEvmChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import { isSupportedPermitInfo, PermitHookData } from '@cowprotocol/permit-utils'

import { t } from '@lingui/core/macro'

import { estimateApprove, extractApprovalAmountFromLogs, type ApprovalTxReceipt } from 'modules/erc20Approve'
import { GeneratePermitHook, IsTokenPermittableResult } from 'modules/permit'
import { shouldZeroApprove } from 'modules/zeroApproval'

import { TransactionNotBroadcastError } from 'common/hooks/useGetReceipt'

import { EoaTwapFlowUpdater } from '../../../hooks/useEoaTwapSigningStep'
import { EoaTwapSigningPhase, EoaTwapSigningSteps } from '../../../state/eoaTwapSigningStepAtom'
import { EoaTwapApprovalNeeds } from '../../../utils/buildEoaTwapSigningStepPlan'

const log = createCowLogger('EOA TWAP approve')

/**
 * Grace period before treating a missing hash as never-broadcast.
 * Matches FinalizeTxUpdater (`checkOnChainTransaction`) — MetaMask Smart Transactions can return a
 * synthetic hash that is cancelled before any real tx is submitted.
 */
const NOT_BROADCAST_GRACE_PERIOD_MS: Partial<Record<SupportedChainId, number>> = {
  [SupportedChainId.MAINNET]: 60_000,
  [SupportedChainId.GNOSIS_CHAIN]: 30_000,
  [SupportedChainId.ARBITRUM_ONE]: 15_000,
  [SupportedChainId.BASE]: 15_000,
  [SupportedChainId.SEPOLIA]: 30_000,
}
const DEFAULT_NOT_BROADCAST_GRACE_PERIOD_MS = 30_000
const APPROVAL_RECEIPT_POLL_MS = 2_000
/** Upper bound once the tx is known to exist in the mempool / on a lagging RPC. */
const APPROVAL_RECEIPT_TIMEOUT_MS = 180_000

export interface EnsureEoaTwapSpenderAllowanceParams {
  config: Config
  chainId: SupportedChainId
  account: AccountAddress
  sellTokenAddress: Address
  sellTokenName: string | undefined
  spender: AccountAddress
  amountToCover: bigint
  amountToApprove: bigint
  /**
   * When provided (with {@link generatePermitHook}) and the token supports EIP-2612 / Dai-like
   * permit, a permit is preferred for the spender allowance (currently ComposableCowPoller).
   * Omit to use on-chain approve only.
   */
  permitInfo?: IsTokenPermittableResult
  generatePermitHook?: GeneratePermitHook
  /** Override for on-chain approve stepper step. */
  step?: EoaTwapSigningSteps
  /** Override for permit stepper step (defaults to `step`). */
  permitStep?: EoaTwapSigningSteps
  /** Override for USDT-style zero-approve step (defaults to ZeroApprovePoller, or `step` when set). */
  zeroStep?: EoaTwapSigningSteps
  /**
   * When permit generation fails and we fall back to on-chain approve, replace the stepper plan
   * so PermitPoller is not left as an orphan upcoming step.
   */
  onChainFallbackPlan?: EoaTwapSigningSteps[]
  onSigningStep: EoaTwapFlowUpdater
  approvalNeeds: EoaTwapApprovalNeeds
}

export interface GetEoaTwapApprovalNeedsParams {
  config: Config
  account: AccountAddress
  sellTokenAddress: Address
  spender: AccountAddress
  amountToCover: bigint
  amountToApprove: bigint
}

interface ApproveEoaSellTokenParams {
  config: Config
  chainId: SupportedChainId
  account: AccountAddress
  sellTokenAddress: Address
  spender: string
  amount: bigint
  onSubmitted: () => void
}

interface RunOnChainAllowanceStepsParams {
  config: Config
  chainId: SupportedChainId
  account: AccountAddress
  sellTokenAddress: Address
  spender: AccountAddress
  amountToCover: bigint
  amountToApprove: bigint
  needsZeroApproval: boolean
  approveStep: EoaTwapSigningSteps
  zeroApproveStep: EoaTwapSigningSteps
  onSigningStep: EoaTwapFlowUpdater
}

interface RunOnChainApprovalStepParams {
  config: Config
  chainId: SupportedChainId
  account: AccountAddress
  sellTokenAddress: Address
  spender: AccountAddress
  amount: bigint
  step: EoaTwapSigningSteps
  onSigningStep: EoaTwapFlowUpdater
  /**
   * When set, read the Approval event from the mined receipt and throw if the
   * approved amount is below this (e.g. the user edited the wallet approve amount down).
   */
  minApprovedAmount?: bigint
}

interface TryGeneratePermitAllowanceParams {
  account: AccountAddress
  sellTokenAddress: Address
  sellTokenName: string | undefined
  spender: AccountAddress
  amountToCover: bigint
  permitInfo: IsTokenPermittableResult
  generatePermitHook: GeneratePermitHook
  permitUiStep: EoaTwapSigningSteps
  approveStep: EoaTwapSigningSteps
  zeroApproveStep: EoaTwapSigningSteps
  needsZeroApproval: boolean
  onChainFallbackPlan: EoaTwapSigningSteps[] | undefined
  onSigningStep: EoaTwapFlowUpdater
}

/**
 * Ensures the EOA has allowance (or a permit) for `spender` to pull `amountToCover`.
 *
 * In EOA TWAP, this is currently used for ComposableCowPoller allowance.
 *
 * With `permitInfo` + `generatePermitHook`: prefer EIP-2612 / Dai-like permit for the full
 * TWAP sell when supported. Otherwise: execute on-chain zero-approve (if needed) and approve.
 *
 * On on-chain approve, the transaction usually approves `amountToApprove` (typically
 * `maxUint256`) and validates that the emitted Approval amount still covers `amountToCover`,
 * throwing "Approved amount is not sufficient!" if not.
 *
 * When permit succeeds, returns `permitData` for the caller to include in setup execution.
 */
export async function ensureEoaTwapSpenderAllowance({
  config,
  chainId,
  account,
  sellTokenAddress,
  sellTokenName,
  spender,
  amountToCover,
  amountToApprove,
  permitInfo,
  generatePermitHook,
  step,
  permitStep,
  zeroStep,
  onChainFallbackPlan,
  onSigningStep,
  approvalNeeds,
}: EnsureEoaTwapSpenderAllowanceParams): Promise<PermitHookData | null> {
  const { needsApproval, needsZeroApproval } = approvalNeeds
  const approveStep = step ?? EoaTwapSigningSteps.ApprovePoller
  const permitUiStep = permitStep ?? approveStep
  const zeroApproveStep = zeroStep ?? step ?? EoaTwapSigningSteps.ZeroApprovePoller

  if (!needsApproval) {
    return null
  }

  if (generatePermitHook && isSupportedPermitInfo(permitInfo)) {
    const permitResult = await tryGeneratePermitAllowance({
      account,
      sellTokenAddress,
      sellTokenName,
      spender,
      amountToCover,
      permitInfo,
      generatePermitHook,
      permitUiStep,
      approveStep,
      zeroApproveStep,
      needsZeroApproval,
      onChainFallbackPlan,
      onSigningStep,
    })

    if (permitResult) {
      return permitResult
    }
  }

  await runOnChainAllowanceSteps({
    config,
    chainId,
    account,
    sellTokenAddress,
    spender,
    amountToCover,
    amountToApprove,
    needsZeroApproval,
    approveStep,
    zeroApproveStep,
    onSigningStep,
  })

  return null
}

export async function getEoaTwapApprovalNeeds({
  config,
  account,
  sellTokenAddress,
  spender,
  amountToCover,
  amountToApprove,
}: GetEoaTwapApprovalNeedsParams): Promise<EoaTwapApprovalNeeds> {
  const eoaAllowance = await readContract(config, {
    address: sellTokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [account, spender],
  }).catch(() => 0n)

  const needsApproval = eoaAllowance < amountToCover

  const needsZeroApproval = needsApproval
    ? await shouldZeroApprove({
        tokenAddress: sellTokenAddress,
        owner: account,
        spender,
        amountToApprove,
        forceApprove: true,
        config,
      }).then((result) => result ?? false)
    : false

  return { needsApproval, needsZeroApproval }
}

async function approveEoaSellToken({
  config,
  chainId,
  account,
  sellTokenAddress,
  spender,
  amount,
  onSubmitted,
}: ApproveEoaSellTokenParams): Promise<ApprovalTxReceipt> {
  if (!isEvmChain(chainId)) {
    throw new Error(`Unsupported chain for approve: ${chainId}`)
  }

  const publicClient = getPublicClient(config)

  if (!publicClient) {
    throw new Error('Public client is required to approve sell token')
  }

  const estimation = await estimateApprove(publicClient, sellTokenAddress, spender, amount, account, chainId)

  const hash = await writeContract(config, {
    address: sellTokenAddress,
    abi: erc20Abi,
    functionName: 'approve',
    args: [spender as Address, amount],
    gas: calculateGasMargin(estimation.gasLimit),
    account,
  })

  onSubmitted()

  try {
    const txResponse = await waitForEoaTwapApprovalReceipt(config, hash, chainId)

    return {
      status: txResponse.status,
      blockNumber: txResponse.blockNumber,
      transactionHash: txResponse.transactionHash,
      logs: txResponse.logs.map((logEntry) => ({
        address: logEntry.address,
        topics: [...logEntry.topics],
        data: logEntry.data,
      })),
    }
  } catch (waitError) {
    throw toApprovalUserError(waitError)
  }
}

async function runOnChainAllowanceSteps({
  config,
  chainId,
  account,
  sellTokenAddress,
  spender,
  amountToCover,
  amountToApprove,
  needsZeroApproval,
  approveStep,
  zeroApproveStep,
  onSigningStep,
}: RunOnChainAllowanceStepsParams): Promise<void> {
  if (needsZeroApproval) {
    await runOnChainApprovalStep({
      config,
      chainId,
      account,
      sellTokenAddress,
      spender,
      amount: 0n,
      step: zeroApproveStep,
      onSigningStep,
    })
  }

  await runOnChainApprovalStep({
    config,
    chainId,
    account,
    sellTokenAddress,
    spender,
    amount: amountToApprove,
    step: approveStep,
    onSigningStep,
    minApprovedAmount: amountToCover,
  })
}

async function runOnChainApprovalStep({
  config,
  chainId,
  account,
  sellTokenAddress,
  spender,
  amount,
  step,
  onSigningStep,
  minApprovedAmount,
}: RunOnChainApprovalStepParams): Promise<void> {
  onSigningStep({ step, phase: EoaTwapSigningPhase.Sign })

  const receipt = await approveEoaSellToken({
    config,
    chainId,
    account,
    sellTokenAddress,
    spender,
    amount,
    onSubmitted: () => {
      onSigningStep({ step, phase: EoaTwapSigningPhase.WaitingForTx })
    },
  })

  if (receipt.status !== 'success') {
    throw new Error('Approval transaction failed')
  }

  if (minApprovedAmount !== undefined) {
    const approvedAmount = extractApprovalAmountFromLogs(receipt, sellTokenAddress, account, spender)

    if (approvedAmount === undefined || approvedAmount < minApprovedAmount) {
      throw new Error(t`Approved amount is not sufficient!`)
    }
  }

  onSigningStep({ step, phase: EoaTwapSigningPhase.Confirmed })
}

function toApprovalUserError(error: unknown): Error {
  if (error instanceof TransactionNotBroadcastError) {
    return new Error(t`Approval was cancelled or not broadcast. Please try again.`)
  }
  return error instanceof Error ? error : new Error(String(error))
}

async function tryGeneratePermitAllowance({
  account,
  sellTokenAddress,
  sellTokenName,
  spender,
  amountToCover,
  permitInfo,
  generatePermitHook,
  permitUiStep,
  approveStep,
  zeroApproveStep,
  needsZeroApproval,
  onChainFallbackPlan,
  onSigningStep,
}: TryGeneratePermitAllowanceParams): Promise<PermitHookData | null> {
  if (!isSupportedPermitInfo(permitInfo)) {
    return null
  }

  onSigningStep({ step: permitUiStep, phase: EoaTwapSigningPhase.Sign })

  const permitData = await generatePermitHook({
    inputToken: {
      address: sellTokenAddress,
      name: sellTokenName,
    },
    account,
    permitInfo,
    amount: amountToCover,
    customSpender: spender,
  }).catch((error) => {
    log.warn('Error generating permit data; falling back to approval', error)
    return null
  })

  if (permitData) {
    onSigningStep({ step: permitUiStep, phase: EoaTwapSigningPhase.Confirmed })
    return permitData
  }

  // Permit failed — switch the stepper onto the on-chain path before prompting approve txs.
  onSigningStep({
    step: needsZeroApproval ? zeroApproveStep : approveStep,
    phase: EoaTwapSigningPhase.Sign,
    ...(onChainFallbackPlan ? { plan: onChainFallbackPlan } : undefined),
  })

  return null
}

/**
 * Waits for an approve receipt without hanging forever on MetaMask Smart Transaction
 * synthetic hashes that are never broadcast (see `TransactionNotBroadcastError` / FinalizeTxUpdater).
 */
async function waitForEoaTwapApprovalReceipt(
  config: Config,
  hash: Hex,
  chainId: SupportedChainId,
): Promise<{
  status: 'success' | 'reverted'
  blockNumber: bigint
  transactionHash: Hex
  logs: Array<{ address: Address; topics: Hex[]; data: Hex }>
}> {
  const gracePeriodMs = NOT_BROADCAST_GRACE_PERIOD_MS[chainId] ?? DEFAULT_NOT_BROADCAST_GRACE_PERIOD_MS
  const startedAt = Date.now()

  while (Date.now() - startedAt < APPROVAL_RECEIPT_TIMEOUT_MS) {
    const receipt = await getTransactionReceipt(config, { hash }).catch(() => null)

    if (receipt) {
      return receipt
    }

    let txExists = false
    try {
      await getTransaction(config, { hash })
      txExists = true
    } catch (error: unknown) {
      const name = (error as { name?: string })?.name
      if (name === 'TransactionNotFoundError') {
        txExists = false
      } else {
        // Transient RPC failure — keep polling.
        await delay(APPROVAL_RECEIPT_POLL_MS)
        continue
      }
    }

    const pendingMs = Date.now() - startedAt

    if (!txExists && pendingMs >= gracePeriodMs) {
      log.warn('Approval tx hash not found on-chain after grace period (likely STX synthetic hash)', {
        hash,
        pendingMs,
        gracePeriodMs,
      })
      throw new TransactionNotBroadcastError(hash)
    }

    await delay(APPROVAL_RECEIPT_POLL_MS)
  }

  throw new Error(t`Timed out waiting for the approval transaction. Please try again.`)
}
