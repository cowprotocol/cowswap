import { t } from '@lingui/core/macro'
import { SigningSteps, SigningStepState } from 'entities/trade'

const getSigningStepsTitles = (): Record<SigningSteps, string> => ({
  [SigningSteps.PermitSigning]: t`Confirm approval`,
  [SigningSteps.BridgingSigning]: t`Confirm bridging`,
  [SigningSteps.OrderSigning]: t`Confirm swap`,
})

export function getPendingText(signingStep: SigningStepState): string {
  const signingStepsTitles = getSigningStepsTitles()

  return `${signingStep.stepNumber} ${signingStepsTitles[signingStep.step]}`
}
