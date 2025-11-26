import { i18n, MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { SigningSteps, SigningStepState } from 'entities/trade'

const SIGNING_STEPS_TITLE: Record<SigningSteps, MessageDescriptor> = {
  [SigningSteps.PermitSigning]: msg`Confirm approval`,
  [SigningSteps.BridgingSigning]: msg`Confirm bridging`,
  [SigningSteps.PreparingDepositAddress]: msg`Preparing deposit`,
  [SigningSteps.OrderSigning]: msg`Confirm swap`,
}

export function getPendingText(signingStep: SigningStepState): string {
  return `${signingStep.stepNumber} ${i18n._(SIGNING_STEPS_TITLE[signingStep.step])}`
}
