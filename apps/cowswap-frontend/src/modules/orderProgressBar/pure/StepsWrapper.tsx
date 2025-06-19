import { useRef, ReactNode, useState, useLayoutEffect } from 'react'

import { StepComponent } from './StepComponent'
import * as styledEl from './styled'

import { STEPS, StepStatus } from '../constants'

export function StepsWrapper({
  steps,
  currentStep,
  extraContent,
  customStepTitles,
  customColor,
  isCancelling,
  isUnfillable,
  isBridgingTrade = false,
}: {
  steps: typeof STEPS
  currentStep: number
  extraContent?: ReactNode
  customStepTitles?: { [key: number]: string }
  customColor?: string
  isCancelling?: boolean
  isUnfillable?: boolean
  isBridgingTrade?: boolean
}): ReactNode {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(0)
  const [translateY, setTranslateY] = useState(0)

  useLayoutEffect(() => {
    if (wrapperRef.current) {
      const stepElements = Array.from(wrapperRef.current.children)
      const activeStepHeight = stepElements[currentStep]?.clientHeight || 0
      const nextStepHeight = stepElements[currentStep + 1]?.clientHeight || 0
      const totalHeight = activeStepHeight + nextStepHeight

      setContainerHeight(totalHeight)

      const offsetY = stepElements.slice(0, currentStep).reduce((acc, el) => acc + el.clientHeight, 0)
      setTranslateY(offsetY)
    }
  }, [currentStep, steps.length])

  const getStatus = (index: number): StepStatus => {
    if (index === currentStep) return isCancelling ? StepStatus.CANCELLING : StepStatus.ACTIVE
    if (index === currentStep + 1) return StepStatus.NEXT
    if (index < currentStep) return StepStatus.DONE
    return StepStatus.FUTURE
  }

  return (
    <styledEl.StepsContainer
      $height={containerHeight}
      $minHeight={isCancelling ? '80px' : undefined}
      bottomGradient={!isCancelling}
    >
      <styledEl.StepsWrapper ref={wrapperRef} $translateY={translateY}>
        {steps.map((stepInit, index) => {
          const step = typeof stepInit === 'function' ? stepInit(isBridgingTrade) : stepInit
          const customTitle = customStepTitles?.[index]
          return (
            <div key={index}>
              <StepComponent
                status={getStatus(index)}
                isFirst={index === 0}
                step={{ ...step, title: customTitle || step.title }}
                index={index}
                extraContent={index === currentStep ? extraContent : step.description}
                customColor={index === currentStep ? customColor : undefined}
                isUnfillable={isUnfillable && index === currentStep}
                isCancelling={isCancelling}
              />
            </div>
          )
        })}
      </styledEl.StepsWrapper>
    </styledEl.StepsContainer>
  )
}
