import React, { useEffect, useRef, useState } from 'react'

import { StepComponent } from './StepComponent'
import * as styledEl from './styled'

import { STEPS } from '../constants'

export function StepsWrapper({
  steps,
  currentStep,
  extraContent,
  customStepTitles,
  customColor,
  isCancelling,
  isUnfillable,
}: {
  steps: typeof STEPS
  currentStep: number
  extraContent?: React.ReactNode
  customStepTitles?: { [key: number]: string }
  customColor?: string
  isCancelling?: boolean
  isUnfillable?: boolean
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(0)

  useEffect(() => {
    if (wrapperRef.current) {
      const stepElements = Array.from(wrapperRef.current.children)
      const activeStepHeight = stepElements[currentStep]?.clientHeight || 0
      const nextStepHeight = stepElements[currentStep + 1]?.clientHeight || 0
      const totalHeight = activeStepHeight + nextStepHeight

      setContainerHeight(totalHeight)

      const offsetY = stepElements.slice(0, currentStep).reduce((acc, el) => acc + el.clientHeight, 0)
      wrapperRef.current.style.transform = `translateY(-${offsetY}px)`
    }
  }, [currentStep, steps.length])

  const getStatus = (index: number) => {
    if (index === currentStep) return isCancelling ? 'cancelling' : 'active'
    if (index === currentStep + 1) return 'next'
    if (index < currentStep) return 'done'
    return 'future'
  }

  return (
    <styledEl.StepsContainer
      $height={containerHeight}
      $minHeight={isCancelling ? '80px' : undefined}
      bottomGradient={!isCancelling}
    >
      <styledEl.StepsWrapper ref={wrapperRef}>
        {steps.map((step, index) => {
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
