import React, { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import * as styledEl from './styled'

import { STEPS } from '../../constants'
import { OrderProgressBarStepName } from '../../constants'
import { Description } from '../../sharedStyled'
import { StepsWrapper } from '../StepsWrapper'

interface SolvingStepProps {
  children: React.ReactNode
  stepName?: OrderProgressBarStepName
  showCancellationModal: Command | null
  isBridgingTrade: boolean
}

interface CancelButtonProps {
  showCancellationModal: Command | null
  cancelEventData: ReturnType<typeof toCowSwapGtmEvent>
}

function CancelButton({ showCancellationModal, cancelEventData }: CancelButtonProps): ReactNode {
  if (!showCancellationModal) return null

  return (
    <styledEl.CancelButton data-click-event={cancelEventData} onClick={showCancellationModal}>
      <Trans>cancel the order</Trans>
    </styledEl.CancelButton>
  )
}

interface StepDescriptionProps {
  stepName: OrderProgressBarStepName
  showCancellationModal: Command | null
  cancelEventData: ReturnType<typeof toCowSwapGtmEvent>
}

function UnfillableDescription({
  showCancellationModal,
  cancelEventData,
}: Omit<StepDescriptionProps, 'stepName'>): ReactNode {
  const cancellationModal = showCancellationModal ? (
    <Trans>
      {' '}
      or <CancelButton showCancellationModal={showCancellationModal} cancelEventData={cancelEventData} />
    </Trans>
  ) : (
    '.'
  )

  return (
    <Trans>
      Uh oh! The market price has moved outside of your slippage tolerance. You can wait for prices to change
      {cancellationModal}
    </Trans>
  )
}

function DelayedDescription({
  showCancellationModal,
  cancelEventData,
}: Omit<StepDescriptionProps, 'stepName'>): ReactNode {
  const cancellationModal = showCancellationModal ? (
    <Trans>
      {' '}
      or <CancelButton showCancellationModal={showCancellationModal} cancelEventData={cancelEventData} />
    </Trans>
  ) : (
    '.'
  )
  return (
    <Trans>
      There may be a network issue (such as a gas spike) that is delaying your order. You can wait for the issue to
      resolve{cancellationModal}
    </Trans>
  )
}

function SubmissionFailedDescription(): ReactNode {
  return (
    <Trans>
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
    </Trans>
  )
}

function SolvedDescription(): ReactNode {
  return (
    <Trans>
      Something went wrong and your order couldn't be executed with this batch. But don't worry! CoW Swap is already
      holding another competition for your order.
    </Trans>
  )
}

function DefaultSolvingDescription(): ReactNode {
  return (
    <Trans>
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
    </Trans>
  )
}

const STEP_DESCRIPTIONS: Record<
  OrderProgressBarStepName,
  React.ComponentType<Omit<StepDescriptionProps, 'stepName'>>
> = {
  [OrderProgressBarStepName.UNFILLABLE]: UnfillableDescription,
  [OrderProgressBarStepName.DELAYED]: DelayedDescription,
  [OrderProgressBarStepName.SUBMISSION_FAILED]: SubmissionFailedDescription,
  [OrderProgressBarStepName.SOLVED]: SolvedDescription,
  [OrderProgressBarStepName.INITIAL]: DefaultSolvingDescription,
  [OrderProgressBarStepName.SOLVING]: DefaultSolvingDescription,
  [OrderProgressBarStepName.EXECUTING]: DefaultSolvingDescription,
  [OrderProgressBarStepName.FINISHED]: DefaultSolvingDescription,
  [OrderProgressBarStepName.CANCELLING]: DefaultSolvingDescription,
  [OrderProgressBarStepName.CANCELLED]: DefaultSolvingDescription,
  [OrderProgressBarStepName.EXPIRED]: DefaultSolvingDescription,
  [OrderProgressBarStepName.CANCELLATION_FAILED]: DefaultSolvingDescription,
  [OrderProgressBarStepName.BRIDGING_IN_PROGRESS]: DefaultSolvingDescription,
  [OrderProgressBarStepName.BRIDGING_FAILED]: DefaultSolvingDescription,
  [OrderProgressBarStepName.REFUND_COMPLETED]: DefaultSolvingDescription,
  [OrderProgressBarStepName.BRIDGING_FINISHED]: DefaultSolvingDescription,
}

function StepDescription({ stepName, showCancellationModal, cancelEventData }: StepDescriptionProps): ReactNode {
  const DescriptionComponent = STEP_DESCRIPTIONS[stepName] || DefaultSolvingDescription
  return <DescriptionComponent showCancellationModal={showCancellationModal} cancelEventData={cancelEventData} />
}

function getCustomStepTitles(
  isUnfillable: boolean,
  isDelayed: boolean,
  isSubmissionFailed: boolean,
  isSolved: boolean,
): Record<number, string> | undefined {
  if (isUnfillable) return { 1: t`Price change` }
  if (isDelayed) return { 1: t`Still searching` }
  if (isSubmissionFailed) return { 1: t`A new competition has started` }
  if (isSolved) return { 1: t`A new competition has started` }
  return undefined
}

export function SolvingStep({
  children,
  stepName,
  showCancellationModal,
  isBridgingTrade,
}: SolvingStepProps): ReactNode {
  const isUnfillable = stepName === OrderProgressBarStepName.UNFILLABLE
  const isDelayed = stepName === OrderProgressBarStepName.DELAYED
  const isSubmissionFailed = stepName === OrderProgressBarStepName.SUBMISSION_FAILED
  const isSolved = stepName === OrderProgressBarStepName.SOLVED

  const cancelEventData = toCowSwapGtmEvent({
    category: CowSwapAnalyticsCategory.PROGRESS_BAR,
    action: 'Click Cancel Order',
    label: isSolved ? 'Solved' : 'Solving',
  })

  return (
    <styledEl.ProgressContainer>
      {children}
      <StepsWrapper
        isBridgingTrade={isBridgingTrade}
        steps={STEPS}
        currentStep={1}
        customStepTitles={getCustomStepTitles(isUnfillable, isDelayed, isSubmissionFailed, isSolved)}
        extraContent={
          <Description>
            <StepDescription
              stepName={stepName || OrderProgressBarStepName.SOLVING}
              showCancellationModal={showCancellationModal}
              cancelEventData={cancelEventData}
            />
          </Description>
        }
        customColor={isUnfillable || isDelayed || isSolved || isSubmissionFailed ? '#996815' : undefined}
        isUnfillable={isUnfillable}
      />
    </styledEl.ProgressContainer>
  )
}
