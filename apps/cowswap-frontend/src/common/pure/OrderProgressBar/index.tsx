import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'
import { OrderProgressBarStepName } from 'common/hooks/orderProgressBar'

import { FINAL_STATES } from './constants'
import { RenderProgressTopSection } from './container/RenderProgressTopSection'
import { DebugPanel } from './DebugPanel'
import { CancelledStep } from './steps/CancelledStep'
import { CancellingStep } from './steps/CancellingStep'
import { ExecutingStep } from './steps/ExecutingStep'
import { ExpiredStep } from './steps/ExpiredStep'
import { FinishedStep } from './steps/FinishedStep'
import { InitialStep } from './steps/InitialStep'
import { SolvingStep } from './steps/SolvingStep'
import { OrderProgressBarProps } from './types'

const IS_DEBUG_MODE = false
const DEBUG_FORCE_SHOW_SURPLUS = false

export function OrderProgressBar(props: OrderProgressBarProps) {
  const { stepName = 'initial', debugMode = IS_DEBUG_MODE } = props
  const [debugStep, setDebugStep] = useState<OrderProgressBarStepName>(stepName)
  const currentStep = debugMode ? debugStep : stepName
  const analytics = useCowAnalytics()

  const startTimeRef = useRef<number | null>(null)
  const initialStepTriggeredRef = useRef<boolean>(false)
  const getDuration = useCallback(() => {
    if (startTimeRef.current === null) return null
    return Date.now() - startTimeRef.current
  }, [])

  // Separate useEffect for initial step
  useEffect(() => {
    if (currentStep === 'initial' && !initialStepTriggeredRef.current) {
      startTimeRef.current = Date.now()
      initialStepTriggeredRef.current = true
      analytics.sendEvent({
        category: CowSwapAnalyticsCategory.PROGRESS_BAR,
        action: 'Step Triggered',
        label: currentStep,
        value: 0, // This remains 0 for the initial step
      })
    }
  }, [currentStep, analytics])

  // useEffect for other steps
  useEffect(() => {
    if (currentStep === 'initial') return // Skip for initial step

    const duration = getDuration()
    const isFinalState = FINAL_STATES.includes(currentStep)

    if (duration !== null) {
      const durationInSeconds = duration / 1000

      analytics.sendEvent({
        category: CowSwapAnalyticsCategory.PROGRESS_BAR,
        action: 'Step Triggered',
        label: currentStep,
        value: parseFloat(durationInSeconds.toFixed(2)),
      })

      if (isFinalState) {
        analytics.sendEvent({
          category: CowSwapAnalyticsCategory.PROGRESS_BAR,
          action: 'Order Completed',
          label: currentStep,
          value: parseFloat(durationInSeconds.toFixed(2)),
        })
        startTimeRef.current = null // Reset the timer for the next order
        initialStepTriggeredRef.current = false // Reset the initial step trigger flag
      }
    }
  }, [currentStep, getDuration, analytics])

  // Ensure StepComponent will be a valid React component or null
  let StepComponent: React.ComponentType<OrderProgressBarProps> | null

  if (currentStep === 'cancellationFailed' || currentStep === 'finished') {
    StepComponent = FinishedStepWrapper
  } else {
    StepComponent = STEP_NAME_TO_STEP_COMPONENT[currentStep as keyof typeof STEP_NAME_TO_STEP_COMPONENT] || null
  }

  // Always return a value from the function
  return StepComponent ? (
    <>
      <StepComponent {...props} stepName={currentStep} />
      {debugMode && (
        <DebugPanel
          stepNameToStepComponent={STEP_NAME_TO_STEP_COMPONENT}
          stepName={currentStep}
          setDebugStep={setDebugStep}
        />
      )}
    </>
  ) : null // Fallback return value if StepComponent is not found
}

function InitialStepWrapper(props: OrderProgressBarProps) {
  return (
    <InitialStep>
      <RenderProgressTopSection {...props} debugForceShowSurplus={DEBUG_FORCE_SHOW_SURPLUS} />
    </InitialStep>
  )
}

function ExecutingStepWrapper(props: OrderProgressBarProps) {
  return (
    <ExecutingStep>
      <RenderProgressTopSection {...props} debugForceShowSurplus={DEBUG_FORCE_SHOW_SURPLUS} />
    </ExecutingStep>
  )
}

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

function SolvingStepWrapper(props: OrderProgressBarProps) {
  const { countdown, stepName, showCancellationModal } = props
  const isUnfillable = stepName === 'unfillable'
  const isDelayed = stepName === 'delayed'
  const isSubmissionFailed = stepName === 'submissionFailed'
  const isSolved = stepName === 'solved'
  const calculatedCountdownValue = isUnfillable || isDelayed || isSubmissionFailed || isSolved ? undefined : countdown

  return (
    <SolvingStep stepName={stepName} showCancellationModal={showCancellationModal}>
      <RenderProgressTopSection
        {...props}
        countdown={calculatedCountdownValue}
        debugForceShowSurplus={DEBUG_FORCE_SHOW_SURPLUS}
      />
    </SolvingStep>
  )
}

function CancellingStepWrapper(props: OrderProgressBarProps) {
  return (
    <CancellingStep>
      <RenderProgressTopSection {...props} debugForceShowSurplus={DEBUG_FORCE_SHOW_SURPLUS} />
    </CancellingStep>
  )
}

function CancelledStepWrapper(props: OrderProgressBarProps) {
  return (
    <CancelledStep>
      <RenderProgressTopSection {...props} debugForceShowSurplus={DEBUG_FORCE_SHOW_SURPLUS} />
    </CancelledStep>
  )
}

function ExpiredStepWrapper(props: OrderProgressBarProps) {
  return (
    <ExpiredStep navigateToNewOrder={props.navigateToNewOrder}>
      <RenderProgressTopSection {...props} debugForceShowSurplus={DEBUG_FORCE_SHOW_SURPLUS} />
    </ExpiredStep>
  )
}

const STEP_NAME_TO_STEP_COMPONENT: Record<OrderProgressBarStepName, React.ComponentType<OrderProgressBarProps>> = {
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
}
