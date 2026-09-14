import { EoaTwapSigningPhase, EoaTwapSigningStepState, EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'

export type EoaTwapLeaveConfirmationVariant = 'afterApproval' | 'walletRequest'

const APPROVAL_STEPS = new Set<EoaTwapSigningSteps>([
  EoaTwapSigningSteps.ZeroApprovePoller,
  EoaTwapSigningSteps.ApprovePoller,
  EoaTwapSigningSteps.PermitPoller,
])

const WALLET_SIGN_STEPS = new Set<EoaTwapSigningSteps>([EoaTwapSigningSteps.TwapSetup, EoaTwapSigningSteps.TwapSign])

export function getEoaTwapLeaveConfirmationVariant(
  signingStep: EoaTwapSigningStepState | null,
): EoaTwapLeaveConfirmationVariant | null {
  if (!signingStep) {
    return null
  }

  if (signingStep.step === EoaTwapSigningSteps.Success) {
    return null
  }

  if (signingStep.lockDismiss) {
    return null
  }

  if (isActiveWalletInteraction(signingStep)) {
    return 'walletRequest'
  }

  if (areApprovalStepsComplete(signingStep)) {
    return 'afterApproval'
  }

  return 'walletRequest'
}

function areApprovalStepsComplete(signingStep: EoaTwapSigningStepState): boolean {
  const approvalStepsInPlan = signingStep.plan.filter((step) => APPROVAL_STEPS.has(step))

  if (approvalStepsInPlan.length === 0) {
    return false
  }

  const currentIndex = signingStep.plan.indexOf(signingStep.step)

  return approvalStepsInPlan.every((approvalStep) => {
    const approvalIndex = signingStep.plan.indexOf(approvalStep)

    if (approvalIndex === -1) {
      return false
    }

    if (approvalIndex < currentIndex) {
      return true
    }

    if (approvalIndex === currentIndex) {
      return signingStep.phase === EoaTwapSigningPhase.Confirmed
    }

    return false
  })
}

function isActiveWalletInteraction(signingStep: EoaTwapSigningStepState): boolean {
  const isWalletStep = APPROVAL_STEPS.has(signingStep.step) || WALLET_SIGN_STEPS.has(signingStep.step)

  if (!isWalletStep) {
    return false
  }

  return signingStep.phase === EoaTwapSigningPhase.Sign || signingStep.phase === EoaTwapSigningPhase.WaitingForTx
}
