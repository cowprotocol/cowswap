import React, { ComponentType } from 'react'

import { BridgingStep } from './BridgingStep'
import { CancelledStep } from './CancelledStep'
import { CancellingStep } from './CancellingStep'
import { ExecutingStep } from './ExecutingStep'
import { ExpiredStep } from './ExpiredStep'
import { FinishedStep } from './FinishedStep'
import { InitialStep } from './InitialStep'
import { SolvingStep } from './SolvingStep'

import { OrderProgressBarProps, OrderProgressBarStepName } from '../../types'
import { RenderProgressTopSection } from '../RenderProgressTopSection'

const DEBUG_FORCE_SHOW_SURPLUS = false

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function InitialStepWrapper(props: OrderProgressBarProps) {
  return (
    <InitialStep isBridgingTrade={props.isBridgingTrade}>
      <RenderProgressTopSection {...props} debugForceShowSurplus={DEBUG_FORCE_SHOW_SURPLUS} />
    </InitialStep>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function ExecutingStepWrapper(props: OrderProgressBarProps) {
  return (
    <ExecutingStep isBridgingTrade={props.isBridgingTrade}>
      <RenderProgressTopSection {...props} debugForceShowSurplus={DEBUG_FORCE_SHOW_SURPLUS} />
    </ExecutingStep>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function FinishedStepWrapper(props: OrderProgressBarProps) {
  const { stepName, solverCompetition: solvers, totalSolvers, order, surplusData, chainId, receiverEnsName } = props

  return (
    <FinishedStep
      stepName={stepName}
      surplusData={surplusData}
      solvers={solvers}
      order={order}
      chainId={chainId}
      receiverEnsName={receiverEnsName}
      totalSolvers={totalSolvers}
      debugForceShowSurplus={DEBUG_FORCE_SHOW_SURPLUS}
    >
      <RenderProgressTopSection {...props} debugForceShowSurplus={DEBUG_FORCE_SHOW_SURPLUS} />
    </FinishedStep>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function SolvingStepWrapper(props: OrderProgressBarProps) {
  const { countdown, stepName, showCancellationModal, isBridgingTrade } = props
  const isUnfillable = stepName === 'unfillable'
  const isDelayed = stepName === 'delayed'
  const isSubmissionFailed = stepName === 'submissionFailed'
  const isSolved = stepName === 'solved'
  const calculatedCountdownValue = isUnfillable || isDelayed || isSubmissionFailed || isSolved ? undefined : countdown

  return (
    <SolvingStep stepName={stepName} showCancellationModal={showCancellationModal} isBridgingTrade={isBridgingTrade}>
      <RenderProgressTopSection
        {...props}
        countdown={calculatedCountdownValue}
        debugForceShowSurplus={DEBUG_FORCE_SHOW_SURPLUS}
      />
    </SolvingStep>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function CancellingStepWrapper(props: OrderProgressBarProps) {
  return (
    <CancellingStep>
      <RenderProgressTopSection {...props} debugForceShowSurplus={DEBUG_FORCE_SHOW_SURPLUS} />
    </CancellingStep>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function CancelledStepWrapper(props: OrderProgressBarProps) {
  return (
    <CancelledStep>
      <RenderProgressTopSection {...props} debugForceShowSurplus={DEBUG_FORCE_SHOW_SURPLUS} />
    </CancelledStep>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function ExpiredStepWrapper(props: OrderProgressBarProps) {
  return (
    <ExpiredStep navigateToNewOrder={props.navigateToNewOrder}>
      <RenderProgressTopSection {...props} debugForceShowSurplus={DEBUG_FORCE_SHOW_SURPLUS} />
    </ExpiredStep>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function BridgingStepWrapper(props: OrderProgressBarProps) {
  if (!props.stepName || !props.swapAndBridgeContext) return null

  return <BridgingStep context={props.swapAndBridgeContext} surplusData={props.surplusData}></BridgingStep>
}

export const STEP_NAME_TO_STEP_COMPONENT: Record<OrderProgressBarStepName, ComponentType<OrderProgressBarProps>> = {
  initial: InitialStepWrapper,
  solving: SolvingStepWrapper,
  executing: ExecutingStepWrapper,
  finished: FinishedStepWrapper,
  solved: SolvingStepWrapper, // Use SolvingStep for 'solved' state
  delayed: SolvingStepWrapper,
  unfillable: SolvingStepWrapper,
  submissionFailed: SolvingStepWrapper,
  cancelling: CancellingStepWrapper,
  cancelled: CancelledStepWrapper,
  expired: ExpiredStepWrapper,
  cancellationFailed: FinishedStepWrapper,
  bridgingInProgress: BridgingStepWrapper,
  bridgingFailed: BridgingStepWrapper,
  bridgingFinished: BridgingStepWrapper,
  refundCompleted: BridgingStepWrapper,
}
