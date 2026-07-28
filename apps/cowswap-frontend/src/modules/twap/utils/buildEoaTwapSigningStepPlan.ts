import { EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

export interface EoaTwapApprovalNeeds {
  needsApproval: boolean
  needsZeroApproval: boolean
}

/**
 * Builds the ordered list of EOA TWAP signing UI steps for the current placement.
 * Approval steps are included only when needed; setup / funding / creating always follow.
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
