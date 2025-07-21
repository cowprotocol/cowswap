import type { Order } from 'legacy/state/orders/actions'

import { OrderProgressBarStepName } from '../../types'
import { ProgressImageWrapper } from '../ProgressImageWrapper'
import {
  CancelledCancellingTopSection,
  DelayedSolvedSubmissionFailedTopSection,
  ExecutingTopSection,
  ExpiredTopSection,
  FinishedCancellationFailedTopSection,
  InitialTopSection,
  SolvingTopSection,
  UnfillableTopSection,
} from '../TopSections'

export interface ProgressTopSectionProps {
  stepName: OrderProgressBarStepName
  order: Order | undefined
  countdown: number
  randomImage: string
  shouldShowSurplus: boolean | undefined | null
  surplusPercentValue: string
  randomBenefit: string
}

const finalSteps = ['delayed', 'submissionFailed', 'solved']

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function ProgressTopSection({
  stepName,
  order,
  countdown,
  randomImage,
  randomBenefit,
  shouldShowSurplus,
  surplusPercentValue,
}: ProgressTopSectionProps) {
  if (stepName === 'initial') {
    return <InitialTopSection stepName={stepName} order={order} />
  }

  if (stepName === 'unfillable') {
    return (
      <ProgressImageWrapper stepName={stepName}>
        <UnfillableTopSection />
      </ProgressImageWrapper>
    )
  }

  if (finalSteps.includes(stepName)) {
    return (
      <ProgressImageWrapper stepName={stepName}>
        <DelayedSolvedSubmissionFailedTopSection />
      </ProgressImageWrapper>
    )
  }

  if (stepName === 'solving') {
    return (
      <ProgressImageWrapper stepName={stepName}>
        <SolvingTopSection countdown={countdown} />
      </ProgressImageWrapper>
    )
  }

  if (stepName === 'executing') {
    return <ExecutingTopSection stepName={stepName} />
  }

  if (stepName === 'finished' || stepName === 'cancellationFailed') {
    return (
      <FinishedCancellationFailedTopSection
        stepName={stepName}
        order={order}
        randomImage={randomImage}
        shouldShowSurplus={shouldShowSurplus}
        surplusPercentValue={surplusPercentValue}
        randomBenefit={randomBenefit}
      />
    )
  }

  if (stepName === 'cancelled' || stepName === 'cancelling') {
    return <CancelledCancellingTopSection stepName={stepName} />
  }

  if (stepName === 'expired') {
    return <ExpiredTopSection stepName={stepName} />
  }

  return null
}
