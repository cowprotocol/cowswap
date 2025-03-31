import React, {useEffect, useRef, useState } from 'react'

import StepComponent from './StepComponent'

import { STEPS } from '../constants'
import * as styledEl from '../styled'


function StepsWrapper({
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

  return (
    <styledEl.StepsContainer
      $height={containerHeight}
      $minHeight={isCancelling ? '80px' : undefined}
      bottomGradient={!isCancelling}
    >
      <styledEl.StepsWrapper ref={wrapperRef}>
        {steps.map((step, index) => {
          const customTitle = customStepTitles && customStepTitles[index]
          const status =
            index === currentStep
              ? isCancelling
                ? 'cancelling'
                : 'active'
              : index === currentStep + 1
                ? 'next'
                : index < currentStep
                  ? 'done'
                  : 'future'
          return (
            <div key={index}>
              <StepComponent
                status={status}
                isFirst={index === 0}
                step={{ ...step, title: customTitle || step.title }}
                _index={index}
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

export default StepsWrapper
