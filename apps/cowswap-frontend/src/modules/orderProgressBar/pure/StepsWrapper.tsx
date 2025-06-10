import { useEffect, useRef, useState, ReactNode } from 'react'

import { StepComponent } from './StepComponent'
import * as styledEl from './styled'

import { STEPS } from '../constants'

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
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

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
