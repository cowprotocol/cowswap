import { EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

export interface BuildEoaTwapSigningStepPlanParams {
  /** EOA => Vault Relayer allowance, covering the sell=buy BUY setup order (fee estimate + buffer). */
  vaultRelayer: EoaTwapApprovalNeeds

  /** EOA => ComposableCowPoller allowance, covering the full TWAP sell pulled just in time. */
  poller: EoaTwapApprovalNeeds
}

export interface EoaTwapApprovalNeeds {
  needsApproval: boolean
  needsZeroApproval: boolean

  /**
   * When true and {@link needsApproval}, emit a permit step and skip zero-approve.
   * Only used for the Poller. Vault Relayer always uses on-chain approval (`canUsePermit` omitted / false) because the
   * setup sell size is only known after the quote.
   */
  canUsePermit?: boolean
}

interface AppendSpenderApprovalStepIds {
  zero: EoaTwapSigningSteps
  approve: EoaTwapSigningSteps
  /** When set, used instead of zero/approve if {@link EoaTwapApprovalNeeds.canUsePermit}. */
  permit?: EoaTwapSigningSteps
}

/**
 * Builds the ordered list of EOA TWAP signing UI steps for the current placement.
 * - (Optional) {@link EoaTwapSigningSteps.ZeroApproveVaultRelayer} / {@link EoaTwapSigningSteps.ApproveVaultRelayer}: Vault Relayer (on-chain)
 * - (Optional) {@link EoaTwapSigningSteps.PermitPoller}, or {@link EoaTwapSigningSteps.ZeroApprovePoller} /
 *   {@link EoaTwapSigningSteps.ApprovePoller}: ComposableCowPoller (permit preferred when supported)
 * - (Required) {@link EoaTwapSigningSteps.TwapSetup}: two EIP-712 signatures:
 *   - `registerWithSignature`: authorizes the JIT poller schedule
 *   - cow-shed `signCalls`: authorizes the multicall the shed will run in the sell=buy post-hook
 *     (`registerWithSignature` calldata + ComposableCoW create TWAP + optional VR approve on the shed)
 * - (Required) {@link EoaTwapSigningSteps.FundingOrder}: 1-atom sell=buy BUY setup order
 * - (Required) {@link EoaTwapSigningSteps.CreatingOrder}: wait for setup-order settlement
 *
 * Approval steps are omitted when allowance is already sufficient.
 * @see `getEoaTwapPrePlacementAmountToCover`
 */
export function buildEoaTwapSigningStepPlan({
  vaultRelayer,
  poller,
}: BuildEoaTwapSigningStepPlanParams): EoaTwapSigningSteps[] {
  const steps: EoaTwapSigningSteps[] = []

  // Always on-chain approval:
  steps.push(
    ...getSpenderApprovalSteps(vaultRelayer, {
      zero: EoaTwapSigningSteps.ZeroApproveVaultRelayer,
      approve: EoaTwapSigningSteps.ApproveVaultRelayer,
    }),
  )

  // Permit preferred when supported:
  steps.push(
    ...getSpenderApprovalSteps(poller, {
      zero: EoaTwapSigningSteps.ZeroApprovePoller,
      approve: EoaTwapSigningSteps.ApprovePoller,
      permit: EoaTwapSigningSteps.PermitPoller,
    }),
  )

  steps.push(EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.FundingOrder, EoaTwapSigningSteps.CreatingOrder)

  return steps
}

function getSpenderApprovalSteps(
  needs: EoaTwapApprovalNeeds,
  stepIds: AppendSpenderApprovalStepIds,
): EoaTwapSigningSteps[] {
  if (!needs.needsApproval) {
    return []
  }

  if (needs.canUsePermit && stepIds.permit) {
    return [stepIds.permit]
  }

  return needs.needsZeroApproval ? [stepIds.zero, stepIds.approve] : [stepIds.approve]
}
