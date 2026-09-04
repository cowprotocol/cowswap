import { EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

export interface BuildEoaTwapSigningStepPlanParams {
  /** EOA => ComposableCowPoller allowance, covering the full TWAP sell pulled just in time. */
  poller: EoaTwapApprovalNeeds
}

export interface EoaTwapApprovalNeeds {
  needsApproval: boolean
  needsZeroApproval: boolean

  /**
   * When true and {@link needsApproval}, emit a permit step and skip zero-approve.
   * Used for the Poller when the sell token supports EIP-2612 / Dai-like permit.
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
 * - (Optional) {@link EoaTwapSigningSteps.PermitPoller}, or {@link EoaTwapSigningSteps.ZeroApprovePoller} /
 *   {@link EoaTwapSigningSteps.ApprovePoller}: ComposableCowPoller (permit preferred when supported)
 * - (Required) {@link EoaTwapSigningSteps.TwapSetup}: cow-shed EIP-712 + factory TX
 *   (optional EOA => Poller permit calldata + `registerFromShed + optional shed => Vault Relayer approve + ComposableCoW create)
 * - (Required) {@link EoaTwapSigningSteps.CreatingOrder}: mark TWAP active after the setup receipt
 *   (confirmed immediately; setup already waited for mining)
 *
 * Approval steps are omitted when allowance is already sufficient.
 */
export function buildEoaTwapSigningStepPlan({ poller }: BuildEoaTwapSigningStepPlanParams): EoaTwapSigningSteps[] {
  const steps: EoaTwapSigningSteps[] = []

  steps.push(
    ...getSpenderApprovalSteps(poller, {
      zero: EoaTwapSigningSteps.ZeroApprovePoller,
      approve: EoaTwapSigningSteps.ApprovePoller,
      permit: EoaTwapSigningSteps.PermitPoller,
    }),
  )

  steps.push(EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.CreatingOrder)

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
