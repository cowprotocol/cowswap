import { type Address, erc20Abi, maxUint256 } from 'viem'
import type { Config } from 'wagmi'
import { getPublicClient, readContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { calculateGasMargin, createCowLogger } from '@cowprotocol/common-utils'
import { AccountAddress, isEvmChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { isSupportedPermitInfo, PermitHookData } from '@cowprotocol/permit-utils'

import { estimateApprove } from 'modules/erc20Approve'
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
  amountToApprove: CurrencyAmount<Token>
  permitInfo: IsTokenPermittableResult
  generatePermitHook: GeneratePermitHook
  /**
   * When true, prefer on-chain approve over permit (e.g. pre-placement max approve before funding quote).
   * Permit amount must match the funding order; unlimited pre-placement prefers on-chain max approve.
   */
  preferOnChainApprove?: boolean
  onSigningStep?: EoaTwapFlowUpdater
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
  amountToApprove: CurrencyAmount<Token>
}

interface RunOnChainApprovalStepParams {
  config: Config
  chainId: SupportedChainId
  account: AccountAddress
  sellTokenAddress: Address
  spender: string
  amount: bigint
  step: EoaTwapSigningSteps.ZeroApprove | EoaTwapSigningSteps.ApproveOrPermit
  onSigningStep?: EoaTwapFlowUpdater
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
 *   without going back. If the allowance falls short once again, an error will be shown.
 *
 * When `preferOnChainApprove` is false and the token is permittable, a permit may be returned
 * for the caller to attach as a pre-hook instead of an on-chain approve.
 */
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
  onSigningStep,
}: EnsureEoaTwapVaultRelayerApprovalParams): Promise<EnsureEoaTwapVaultRelayerApprovalResult> {
  const { needsApproval, needsZeroApproval } = await getEoaTwapApprovalNeeds({
    config,
    account,
    sellTokenAddress,
    spender,
    amountToCover,
    amountToApprove,
  })

  if (!needsApproval) {
    return { usedPermit: false, permitData: null, promptedWallet: false }
  }

  if (!preferOnChainApprove && isSupportedPermitInfo(permitInfo)) {
    onSigningStep?.(EoaTwapSigningSteps.ApproveOrPermit, EoaTwapSigningPhase.Sign)

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
      onSigningStep?.(EoaTwapSigningSteps.ApproveOrPermit, EoaTwapSigningPhase.Confirmed)
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
      step: EoaTwapSigningSteps.ZeroApprove,
      onSigningStep,
    })
  }

  await runOnChainApprovalStep({
    config,
    chainId,
    account,
    sellTokenAddress,
    spender,
    amount: maxUint256,
    step: EoaTwapSigningSteps.ApproveOrPermit,
    onSigningStep,
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
}: {
  config: Config
  chainId: SupportedChainId
  account: AccountAddress
  sellTokenAddress: Address
  spender: string
  amount: bigint
  onSubmitted?: () => void
}): Promise<void> {
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

  onSubmitted?.()

  await waitForTransactionReceipt(config, { hash })
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
}: RunOnChainApprovalStepParams): Promise<void> {
  onSigningStep?.(step, EoaTwapSigningPhase.Sign)

  await approveEoaSellToken({
    config,
    chainId,
    account,
    sellTokenAddress,
    spender,
    amount,
    onSubmitted: () => {
      onSigningStep?.(step, EoaTwapSigningPhase.WaitingForTx)
    },
  })

  onSigningStep?.(step, EoaTwapSigningPhase.Confirmed)
}
