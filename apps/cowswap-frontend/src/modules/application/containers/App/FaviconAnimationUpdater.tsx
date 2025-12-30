import { useAtomValue } from 'jotai'
import { useEffect, useRef } from 'react'

import { FaviconAnimationController } from 'modules/application/utils/faviconAnimation/controller'
import { ordersProgressBarStateAtom } from 'modules/orderProgressBar/state/atoms'

import { getCurrentFrameSet, subscribeToPreferredThemeChanges } from 'common/favicon'

export function FaviconAnimationUpdater(): null {
  const ordersProgressState = useAtomValue(ordersProgressBarStateAtom)
  const controllerRef = useRef<FaviconAnimationController | null>(null)

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const controller = new FaviconAnimationController(getCurrentFrameSet())
    controllerRef.current = controller

    const unsubscribe = subscribeToPreferredThemeChanges((_, frameSet) => {
      controller.updateFrameSet(frameSet)
    })

    return () => {
      unsubscribe()
      controllerRef.current?.dispose()
      controllerRef.current = null
    }
  }, [])

  useEffect(() => {
    controllerRef.current?.update(ordersProgressState)
  }, [ordersProgressState])

  return null
}
