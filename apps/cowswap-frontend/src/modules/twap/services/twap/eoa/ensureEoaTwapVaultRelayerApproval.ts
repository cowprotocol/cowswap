import { type Address, erc20Abi } from 'viem'
import type { Config } from 'wagmi'
import { getPublicClient, readContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { createCowLogger } from '@cowprotocol/common-utils'
import { AccountAddress, isEvmChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import { isSupportedPermitInfo, PermitHookData } from '@cowprotocol/permit-utils'

import { t } from '@lingui/core/macro'

import {
  extractApprovalAmountFromLogs,
  sendApproveTransaction,
  toApprovalTxReceipt,
  type ApprovalTxReceipt,
} from 'modules/erc20Approve'
import { GeneratePermitHook, IsTokenPermittableResult } from 'modules/permit'
import { shouldZeroApprove } from 'modules/zeroApproval'

import { EoaTwapFlowUpdater } from '../../../hooks/useEoaTwapSigningStep'
import { EoaTwapSigningPhase, EoaTwapSigningSteps } from '../../../state/eoaTwapSigningStepAtom'
import { EoaTwapApprovalNeeds } from '../../../utils/buildEoaTwapSigningStepPlan'

const log = createCowLogger('EOA TWAP approve')

export interface EnsureEoaTwapVaultRelayerApprovalParams {
  config: Config
  chainId: SupportedChainId
  account: AccountAddress
  sellTokenAddress: Address
  sellTokenName: string | undefined
  spender: AccountAddress
  amountToCover: bigint
  amountToApprove: bigint
  permitInfo: IsTokenPermittableResult
  generatePermitHook: GeneratePermitHook
  /**
   * When true, prefer on-chain approve over permit (e.g. pre-placement max approve before funding quote).
   * Permit amount must match the funding order; unlimited pre-placement prefers on-chain max approve.
   */
  preferOnChainApprove?: boolean
  step?: EoaTwapSigningSteps
  onSigningStep: EoaTwapFlowUpdater
  approvalNeeds: EoaTwapApprovalNeeds
}

export interface EnsureEoaTwapVaultRelayerApprovalResult {
  usedPermit: boolean
  permitData: PermitHookData | null
  promptedWallet: boolean
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

/**
 * Ensures the EOA has allowance (or a permit) for the production Vault Relayer to pull `amountToCover`.
 *
 * Used in two places:
 *
 * - Approval check / step (`preferOnChainApprove: true`, `amountToCover` = TWAP sell + funding buffer) with
 *   signing UI. See `getEoaTwapPrePlacementAmountToCover`. When approval is needed, the on-chain tx
 *   still approves `maxUint256`.
 *
 * - Funding check after quote in the FundingOrder step (`amountToCover` = actual funding sell) so a user
 *   whose allowance still falls short (edited approve amount, buffer exceeded, etc.) can still place the order
 *   without going back. If the Approval event amount from the mined receipt is still too low, throws
 *   "Approved amount is not sufficient!".
 *
 * When `preferOnChainApprove` is false and the token is permittable, a permit may be returned
 * for the caller to attach as a pre-hook instead of an on-chain approve.
 */
// eslint-disable-next-line complexity
export async function ensureEoaTwapVaultRelayerApproval({
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
  preferOnChainApprove = false,
  step,
  onSigningStep,
  approvalNeeds,
}: EnsureEoaTwapVaultRelayerApprovalParams): Promise<EnsureEoaTwapVaultRelayerApprovalResult> {
  const { needsApproval, needsZeroApproval } = approvalNeeds

  if (!needsApproval) {
    return { usedPermit: false, permitData: null, promptedWallet: false }
  }

  if (!preferOnChainApprove && isSupportedPermitInfo(permitInfo)) {
    onSigningStep({ step: step ?? EoaTwapSigningSteps.ApproveOrPermit, phase: EoaTwapSigningPhase.Sign })

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
      onSigningStep({ step: step ?? EoaTwapSigningSteps.ApproveOrPermit, phase: EoaTwapSigningPhase.Confirmed })
      return { usedPermit: true, permitData, promptedWallet: true }
    }
  }

  if (needsZeroApproval) {
    await runOnChainApprovalStep({
      config,
      chainId,
      account,
      sellTokenAddress,
      spender,
      amount: 0n,
      step: step ?? EoaTwapSigningSteps.ZeroApprove,
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
    step: step ?? EoaTwapSigningSteps.ApproveOrPermit,
    onSigningStep,
    minApprovedAmount: amountToCover,
  })

  return { usedPermit: false, permitData: null, promptedWallet: true }
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

  const hash = await sendApproveTransaction({
    publicClient,
    tokenAddress: sellTokenAddress,
    spender,
    amount,
    account,
    chainId,
    writeContract: (params) => writeContract(config, params),
  })

  onSubmitted()

  const txResponse = await waitForTransactionReceipt(config, { hash })

  return toApprovalTxReceipt(txResponse)
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
