import { type Address, erc20Abi, maxUint256 } from 'viem'
import type { Config } from 'wagmi'
import { getPublicClient, readContract, writeContract } from 'wagmi/actions'

import { calculateGasMargin, normalizeError } from '@cowprotocol/common-utils'
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

export interface EnsureEoaTwapSpenderAllowanceParams {
  config: Config
  chainId: SupportedChainId
  account: AccountAddress
  sellTokenAddress: Address
  sellTokenName: string | undefined
  /** The amount of sell tokens to cover the TWAP, min for the permit / approval. */
  sellTokenAmount: bigint
  /** The amount of sell tokens to approve or permit, depending what the user selected in the form and what the token supports. */
  amountToPermitOrApprove: bigint
  spender: AccountAddress
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
  /** The amount of sell tokens to cover the TWAP, min for the approval. */
  sellTokenAmount: bigint
  /** The amount of sell tokens to approve, depending what the user selected in the form and what the token supports. */
  amountToApprove: bigint
  spender: AccountAddress
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
  amountToPermit: bigint
  permitInfo: IsTokenPermittableResult
  generatePermitHook: GeneratePermitHook
  permitUiStep: EoaTwapSigningSteps
  onSigningStep: EoaTwapFlowUpdater
}

/**
 * Dai-like permits always set `allowed: true` (unlimited). Only use them when the form
 * selected unlimited approval. Otherwise fall back to on-chain `amountToApprove`.
 */
export function canUseEoaTwapPermit(permitInfo: IsTokenPermittableResult, amountToApprove: bigint): boolean {
  if (!isSupportedPermitInfo(permitInfo)) {
    return false
  }

  if (permitInfo.type === 'dai-like' && amountToApprove !== maxUint256) {
    return false
  }

  return true
}

/**
 * Ensures the EOA has allowance (or a permit) for `spender` to pull `amountToCover`.
 *
 * In EOA TWAP, this is currently used for ComposableCowPoller allowance.
 *
 * With `permitInfo` + `generatePermitHook`: prefer EIP-2612 permit for the exact
 * `amountToCover` (the TWAP sell). Dai-like permits cannot express a finite amount
 * (`allowed: true`), so they are used only when `amountToApprove` is unlimited.
 * Otherwise: execute on-chain zero-approve (if needed) and approve `amountToApprove`
 * (partial sell or unlimited, matching the TWAP form).
 *
 * On on-chain approve, the transaction approves `amountToApprove` and validates that the
 * emitted Approval amount still covers `amountToCover`, throwing
 * "Approved amount is not sufficient!" if not.
 *
 * When permit is offered, a cancelled or failed permit aborts (no on-chain approve fallback),
 * matching swap/limit. On success, returns `permitData` for the caller to include in setup.
 */
export async function ensureEoaTwapSpenderAllowance({
  config,
  chainId,
  account,
  sellTokenAddress,
  sellTokenName,
  spender,
  sellTokenAmount,
  amountToPermitOrApprove,
  permitInfo,
  generatePermitHook,
  step,
  permitStep,
  zeroStep,
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

  // This should never happen because the edit amount screen already validates the amount to approve is greater than the sell amount, but just in case...:
  if (amountToPermitOrApprove < sellTokenAmount) {
    throw new Error('Amount to approve is less than amount to cover')
  }

  if (generatePermitHook && canUseEoaTwapPermit(permitInfo, amountToPermitOrApprove)) {
    return tryGeneratePermitAllowance({
      account,
      sellTokenAddress,
      sellTokenName,
      spender,
      amountToPermit: amountToPermitOrApprove,
      permitInfo,
      generatePermitHook,
      permitUiStep,
      onSigningStep,
    })
  }

  await runOnChainAllowanceSteps({
    config,
    chainId,
    account,
    sellTokenAddress,
    sellTokenAmount,
    amountToApprove: amountToPermitOrApprove,
    spender,
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
  sellTokenAmount,
  amountToApprove,
  spender,
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
    minApprovedAmount: sellTokenAmount,
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
  amountToPermit,
  permitInfo,
  generatePermitHook,
  permitUiStep,
  onSigningStep,
}: TryGeneratePermitAllowanceParams): Promise<PermitHookData> {
  if (!isSupportedPermitInfo(permitInfo)) {
    throw new Error(t`Unable to generate permit data`)
  }

  onSigningStep({ step: permitUiStep, phase: EoaTwapSigningPhase.Sign })

  const permitData = await generatePermitHook({
    inputToken: {
      address: sellTokenAddress,
      name: sellTokenName,
    },
    account,
    permitInfo,
    amount: amountToPermit,
    customSpender: spender,
  })

  if (!permitData) {
    throw new Error(t`Unable to generate permit data`)
  }

  console.log(permitData)

  onSigningStep({ step: permitUiStep, phase: EoaTwapSigningPhase.Confirmed })
  return permitData
}
