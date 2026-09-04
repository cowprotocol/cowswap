import { type Address, erc20Abi } from 'viem'
import type { Config } from 'wagmi'
import { getPublicClient, readContract, writeContract } from 'wagmi/actions'

import { calculateGasMargin, createCowLogger, normalizeError } from '@cowprotocol/common-utils'
import { AccountAddress, isEvmChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import { isSupportedPermitInfo, PermitHookData } from '@cowprotocol/permit-utils'

import { t } from '@lingui/core/macro'

import { estimateApprove, extractApprovalAmountFromLogs, type ApprovalTxReceipt } from 'modules/erc20Approve'
import { GeneratePermitHook, IsTokenPermittableResult } from 'modules/permit'
import { shouldZeroApprove } from 'modules/zeroApproval'

import { TransactionNotBroadcastError } from 'common/hooks/useGetReceipt'

import { waitForEoaTwapTxReceipt } from './waitForEoaTwapTxReceipt.utils'

import { EoaTwapFlowUpdater } from '../../../hooks/useEoaTwapSigningStep'
import { EoaTwapSigningPhase, EoaTwapSigningSteps } from '../../../state/eoaTwapSigningStepAtom'
import { EoaTwapApprovalNeeds } from '../../../utils/buildEoaTwapSigningStepPlan'

const log = createCowLogger('EOA TWAP approve')

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
  amountToApprove: bigint
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
 * With `permitInfo` + `generatePermitHook`: prefer EIP-2612 / Dai-like permit for
 * `amountToApprove` (typically `maxUint256`) when supported, matching on-chain approve.
 * Permitting only `amountToCover` would overwrite an existing max allowance.
 * Otherwise: execute on-chain zero-approve (if needed) and approve.
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
      amountToApprove,
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
    const txResponse = await waitForEoaTwapTxReceipt(config, hash, chainId)

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
  } catch (waitError: unknown) {
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

function toApprovalUserError(err: unknown): Error {
  const error = normalizeError(err)

  if (error instanceof TransactionNotBroadcastError) {
    return new Error(t`Approval was cancelled or not broadcast. Please try again.`)
  }

  return error
}

async function tryGeneratePermitAllowance({
  account,
  sellTokenAddress,
  sellTokenName,
  spender,
  amountToApprove,
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
    amount: amountToApprove,
    customSpender: spender,
  }).catch((err: unknown) => {
    const error = normalizeError(err)
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
