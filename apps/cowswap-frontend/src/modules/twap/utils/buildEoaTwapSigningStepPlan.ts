import { EOA_TWAP_JIT_REGISTER_VIA_SIGNATURE } from '../composable-cow-poller/composable-cow-poller.constants'
import { EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

export interface BuildEoaTwapSigningStepPlanParams {
  /** EOA => Vault Relayer allowance, covering the sell=buy setup order (TWAP sell amount + funding buffer). */
  vaultRelayer: EoaTwapApprovalNeeds
  /** EOA => ComposableCowPoller allowance, covering the full TWAP sell pulled just in time. */
  poller: EoaTwapApprovalNeeds
}

export interface EoaTwapApprovalNeeds {
  needsApproval: boolean
  needsZeroApproval: boolean
}

/**
 * Builds the ordered list of EOA TWAP signing UI steps for the current placement.
 * - (Optional) Vault Relayer zero approval / approval steps
 * - (Optional) Poller zero approval / approval steps
 * - (Required, unless registering via signature) Poller schedule registration step
 * - (Required) Setup step
 * - (Required) Funding order step
 * - (Required) Creating order step
 *
 * Note that approval steps are included only when needed at plan/build time based on the `needs` params.
 * @see `getEoaTwapPrePlacementAmountToCover`
 */
export function buildEoaTwapSigningStepPlan({
  vaultRelayer,
  poller,
}: BuildEoaTwapSigningStepPlanParams): EoaTwapSigningSteps[] {
  const steps: EoaTwapSigningSteps[] = []

  // TODO: Handle permit?

  if (vaultRelayer.needsZeroApproval) {
    steps.push(EoaTwapSigningSteps.ZeroApprove)
  }

  if (vaultRelayer.needsApproval) {
    steps.push(EoaTwapSigningSteps.ApproveOrPermit)
  }

  if (poller.needsZeroApproval) {
    steps.push(EoaTwapSigningSteps.ZeroApprovePoller)
  }

  if (poller.needsApproval) {
    steps.push(EoaTwapSigningSteps.ApprovePoller)
  }

  if (!EOA_TWAP_JIT_REGISTER_VIA_SIGNATURE) {
    steps.push(EoaTwapSigningSteps.RegisterPoller)
  }

  steps.push(EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.FundingOrder, EoaTwapSigningSteps.CreatingOrder)

  return steps
}
