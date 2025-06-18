import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { FINAL_STATES } from '../../constants'
import { OrderProgressBarProps, OrderProgressBarStepName } from '../../types'
import { DebugPanel } from '../DebugPanel'
import { STEP_NAME_TO_STEP_COMPONENT } from '../steps/stepsRegistry'

const IS_DEBUG_MODE = false

export function OrderProgressBar(props: OrderProgressBarProps): ReactNode {
  const { stepName = OrderProgressBarStepName.INITIAL, debugMode = IS_DEBUG_MODE } = props
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
    if (currentStep === OrderProgressBarStepName.INITIAL && !initialStepTriggeredRef.current) {
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
    if (currentStep === OrderProgressBarStepName.INITIAL) return // Skip for initial step

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
  const StepComponent = STEP_NAME_TO_STEP_COMPONENT[currentStep] || null

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
