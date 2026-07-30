import { EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

export interface EoaTwapApprovalNeeds {
  needsApproval: boolean
  needsZeroApproval: boolean
}

/**
 * Builds the ordered list of EOA TWAP signing UI steps for the current placement.
 * - (Optional) Zero approval step
 * - (Optional) Approval step
 * - (Required) Setup step
 * - (Required) Funding order step
 * - (Required) Creating order step
 *
 * Note that approval steps are included only when needed at plan/build time based on the `needs` param,
 * which accounts for TWAP sell amount + funding buffer.
 * @see `getEoaTwapPrePlacementAmountToCover`
 */
export function buildEoaTwapSigningStepPlan(needs: EoaTwapApprovalNeeds): EoaTwapSigningSteps[] {
  const steps: EoaTwapSigningSteps[] = []

  // TODO: Handle permit?

  if (needs.needsZeroApproval) {
    steps.push(EoaTwapSigningSteps.ZeroApprove)
  }

  if (needs.needsApproval) {
    steps.push(EoaTwapSigningSteps.ApproveOrPermit)
  }

  steps.push(EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.FundingOrder, EoaTwapSigningSteps.CreatingOrder)

  return steps
}
