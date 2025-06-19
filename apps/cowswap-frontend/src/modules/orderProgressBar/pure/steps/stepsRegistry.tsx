import { ComponentType, ReactNode } from 'react'

import { BridgingStep } from './BridgingStep'
import { CancelledStep } from './CancelledStep'
import { CancellingStep } from './CancellingStep'
import { ExecutingStep } from './ExecutingStep'
import { ExpiredStep } from './ExpiredStep'
import { FinishedStep } from './FinishedStep'
import { InitialStep } from './InitialStep'
import { SolvingStep } from './SolvingStep'

import { OrderProgressBarStepName } from '../../constants'
import { OrderProgressBarProps } from '../../types'
import { RenderProgressTopSection } from '../RenderProgressTopSection'

const DEBUG_FORCE_SHOW_SURPLUS = false

function InitialStepWrapper(props: OrderProgressBarProps): ReactNode {
  return (
    <InitialStep isBridgingTrade={props.isBridgingTrade}>
      <RenderProgressTopSection {...props} debugForceShowSurplus={DEBUG_FORCE_SHOW_SURPLUS} />
    </InitialStep>
  )
}

function ExecutingStepWrapper(props: OrderProgressBarProps): ReactNode {
  return (
    <ExecutingStep isBridgingTrade={props.isBridgingTrade}>
      <RenderProgressTopSection {...props} debugForceShowSurplus={DEBUG_FORCE_SHOW_SURPLUS} />
    </ExecutingStep>
  )
}

function FinishedStepWrapper(props: OrderProgressBarProps): ReactNode {
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

function SolvingStepWrapper(props: OrderProgressBarProps): ReactNode {
  const { countdown, stepName, showCancellationModal, isBridgingTrade } = props
  const isUnfillable = stepName === OrderProgressBarStepName.UNFILLABLE
  const isDelayed = stepName === OrderProgressBarStepName.DELAYED
  const isSubmissionFailed = stepName === OrderProgressBarStepName.SUBMISSION_FAILED
  const isSolved = stepName === OrderProgressBarStepName.SOLVED
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

function CancellingStepWrapper(props: OrderProgressBarProps): ReactNode {
  return (
    <CancellingStep>
      <RenderProgressTopSection {...props} debugForceShowSurplus={DEBUG_FORCE_SHOW_SURPLUS} />
    </CancellingStep>
  )
}

function CancelledStepWrapper(props: OrderProgressBarProps): ReactNode {
  return (
    <CancelledStep>
      <RenderProgressTopSection {...props} debugForceShowSurplus={DEBUG_FORCE_SHOW_SURPLUS} />
    </CancelledStep>
  )
}

function ExpiredStepWrapper(props: OrderProgressBarProps): ReactNode {
  return (
    <ExpiredStep navigateToNewOrder={props.navigateToNewOrder}>
      <RenderProgressTopSection {...props} debugForceShowSurplus={DEBUG_FORCE_SHOW_SURPLUS} />
    </ExpiredStep>
  )
}

function BridgingStepWrapper(props: OrderProgressBarProps): ReactNode {
  if (!props.stepName || !props.swapAndBridgeContext) return null

  return <BridgingStep context={props.swapAndBridgeContext} surplusData={props.surplusData}></BridgingStep>
}

export const STEP_NAME_TO_STEP_COMPONENT: Record<OrderProgressBarStepName, ComponentType<OrderProgressBarProps>> = {
  [OrderProgressBarStepName.INITIAL]: InitialStepWrapper,
  [OrderProgressBarStepName.SOLVING]: SolvingStepWrapper,
  [OrderProgressBarStepName.EXECUTING]: ExecutingStepWrapper,
  [OrderProgressBarStepName.FINISHED]: FinishedStepWrapper,
  [OrderProgressBarStepName.SOLVED]: SolvingStepWrapper, // Use SolvingStep for 'solved' state
  [OrderProgressBarStepName.DELAYED]: SolvingStepWrapper,
  [OrderProgressBarStepName.UNFILLABLE]: SolvingStepWrapper,
  [OrderProgressBarStepName.SUBMISSION_FAILED]: SolvingStepWrapper,
  [OrderProgressBarStepName.CANCELLING]: CancellingStepWrapper,
  [OrderProgressBarStepName.CANCELLED]: CancelledStepWrapper,
  [OrderProgressBarStepName.EXPIRED]: ExpiredStepWrapper,
  [OrderProgressBarStepName.CANCELLATION_FAILED]: FinishedStepWrapper,
  [OrderProgressBarStepName.BRIDGING_IN_PROGRESS]: BridgingStepWrapper,
  [OrderProgressBarStepName.BRIDGING_FAILED]: BridgingStepWrapper,
  [OrderProgressBarStepName.BRIDGING_FINISHED]: BridgingStepWrapper,
  [OrderProgressBarStepName.REFUND_COMPLETED]: BridgingStepWrapper,
}
