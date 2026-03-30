import { useAtom } from 'jotai'
import { ReactNode, useEffect, useRef } from 'react'

import { debounce } from '@cowprotocol/common-utils'

import { driver, DriveStep } from 'driver.js'
import { uiGuideState } from 'entities/uiGuide'

interface UiGuideContainerProps {
  steps: DriveStep[]
}

export function UiGuideContainer({ steps }: UiGuideContainerProps): ReactNode {
  const [{ currentStep }, setState] = useAtom(uiGuideState)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current || typeof currentStep !== 'number') return

    startedRef.current = true

    const uiGuide = driver({
      showProgress: true,
      animate: true,
      steps,
      onHighlightStarted: (_element, step) => {
        const index = steps.findIndex((s) => s.element === step.element)

        if (index >= 0) {
          setState({ currentStep: index, skipped: false })
        }
      },
    })

    const observer = new MutationObserver(debounce(uiGuide.refresh, 200))

    observer.observe(document.body, { childList: true, subtree: true })

    uiGuide.moveTo(currentStep > 0 ? currentStep - 1 : 0)

    const activeStep = uiGuide.getActiveStep()

    if (activeStep && currentStep > 0) {
      activeStep.popover?.onNextClick?.(undefined, activeStep, {
        driver: uiGuide,
        state: uiGuide.getState(),
        config: uiGuide.getConfig(),
      })
    }

    return () => {
      observer.disconnect()
    }
  }, [steps, setState, currentStep])

  return null
}
