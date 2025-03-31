import React from 'react'

import { Command } from '@cowprotocol/types'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { OrderProgressBarStepName } from 'common/hooks/orderProgressBarV2'

import * as styledEl from './styled'

import { STEPS } from '../constants'
import StepsWrapper from '../container/StepsWrapper'

interface SolvingStepProps {
  children: React.ReactNode
  stepName?: OrderProgressBarStepName
  showCancellationModal: Command | null
}

function SolvingStep({ children, stepName, showCancellationModal }: SolvingStepProps) {
  const isUnfillable = stepName === 'unfillable'
  const isDelayed = stepName === 'delayed'
  const isSubmissionFailed = stepName === 'submissionFailed'
  const isSolved = stepName === 'solved'

  const cancelEventData = toCowSwapGtmEvent({
    category: CowSwapAnalyticsCategory.PROGRESS_BAR,
    action: 'Click Cancel Order',
    label: isSolved ? 'Solved' : 'Solving',
  })

  return (
    <styledEl.ProgressContainer>
      {children}
      <StepsWrapper
        steps={STEPS}
        currentStep={1}
        customStepTitles={
          isUnfillable
            ? { 1: 'Price change' }
            : isDelayed
              ? { 1: 'Still searching' }
              : isSubmissionFailed
                ? { 1: 'A new competition has started' }
                : isSolved
                  ? { 1: 'A new competition has started' }
                  : undefined
        }
        extraContent={
          <styledEl.Description>
            {isUnfillable ? (
              <>
                Uh oh! The market price has moved outside of your slippage tolerance. You can wait for prices to change
                {showCancellationModal && (
                  <>
                    {' '}
                    or{' '}
                    <styledEl.CancelButton data-click-event={cancelEventData} onClick={showCancellationModal}>
                      cancel the order
                    </styledEl.CancelButton>
                  </>
                )}
                .
              </>
            ) : isDelayed ? (
              <>
                There may be a network issue (such as a gas spike) that is delaying your order. You can wait for the
                issue to resolve
                {showCancellationModal && (
                  <>
                    {' '}
                    or{' '}
                    <styledEl.CancelButton data-click-event={cancelEventData} onClick={showCancellationModal}>
                      cancel your order
                    </styledEl.CancelButton>
                  </>
                )}
                .
              </>
            ) : isSubmissionFailed ? (
              <>
                Something went wrong. But don't worry!{' '}
                <styledEl.Link
                  href="https://docs.cow.fi/cow-protocol/concepts/introduction/solvers"
                  target="_blank"
                  data-click-event={toCowSwapGtmEvent({
                    category: CowSwapAnalyticsCategory.PROGRESS_BAR,
                    action: 'Click Learn More',
                    label: 'Submission Failed',
                  })}
                >
                  CoW Swap solvers
                </styledEl.Link>{' '}
                are searching again for the best price for you.
              </>
            ) : isSolved ? (
              <>
                Something went wrong and your order couldn't be executed with this batch. But don't worry! CoW Swap is
                already holding another competition for your order.
              </>
            ) : (
              <>
                <styledEl.Link
                  href="https://docs.cow.fi/cow-protocol/concepts/introduction/solvers"
                  target="_blank"
                  data-click-event={toCowSwapGtmEvent({
                    category: CowSwapAnalyticsCategory.PROGRESS_BAR,
                    action: 'Click Learn More',
                    label: 'Solving',
                  })}
                >
                  CoW Swap solvers
                </styledEl.Link>{' '}
                are scanning liquidity sources across DeFi. The one that finds you the best price wins!
              </>
            )}
          </styledEl.Description>
        }
        customColor={isUnfillable || isDelayed || isSolved || isSubmissionFailed ? '#996815' : undefined}
        isUnfillable={isUnfillable}
      />
    </styledEl.ProgressContainer>
  )
}

export default SolvingStep
