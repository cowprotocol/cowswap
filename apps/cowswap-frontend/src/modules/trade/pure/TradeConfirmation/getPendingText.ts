import { SigningSteps, SigningStepState } from 'entities/trade'

const SigningStepsTitles: Record<SigningSteps, string> = {
  [SigningSteps.PermitSigning]: 'Confirm approval',
  [SigningSteps.BridgingSigning]: 'Confirm bridging',
  [SigningSteps.OrderSigning]: 'Confirm swap',
}

export function getPendingText(signingStep: SigningStepState): string {
  return `${signingStep.stepNumber} ${SigningStepsTitles[signingStep.step]}`
}
