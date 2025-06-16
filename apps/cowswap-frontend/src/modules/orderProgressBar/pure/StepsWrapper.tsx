import { useEffect, useRef, ReactNode, useMemo } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media } from '@cowprotocol/ui'

import { StepComponent } from './StepComponent'
import * as styledEl from './styled'

import { STEPS } from '../constants'
import { calculateContainerHeight, calculateTransformOffset, STEP_HEIGHTS } from '../utils/heightManager'

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
  const isMobile = useMediaQuery(Media.upToSmall(false))

  // Calculate consistent heights
  const { containerHeight, transformOffset } = useMemo(() => {
    const stepHeight = isMobile ? STEP_HEIGHTS.mobile.stepContent : STEP_HEIGHTS.desktop.stepContent
    const height = calculateContainerHeight(currentStep, steps.length, isMobile)
    const offset = calculateTransformOffset(currentStep, stepHeight)

    return {
      containerHeight: height,
      transformOffset: offset,
    }
  }, [currentStep, steps.length, isMobile])

  // Apply transform with fixed step heights
  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.style.transform = `translateY(-${transformOffset}px)`
    }
  }, [transformOffset])

  const getStatus = (index: number): 'cancelling' | 'cancelled' | 'expired' | 'active' | 'next' | 'future' | 'done' => {
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
      $stepContentHeight={isMobile ? STEP_HEIGHTS.mobile.stepContent : STEP_HEIGHTS.desktop.stepContent}
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
