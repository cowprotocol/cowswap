import { useEffect, useState } from 'react'

import { useIsWindowVisible } from './useIsWindowVisible'

/**
 * Returns `true` after the tab has been continuously hidden
 * (`document.visibilityState === 'hidden'`) for at least `thresholdMs`, and
 * flips back to `false` the moment the tab becomes visible again. A brief tab
 * switch that ends before the threshold elapses never flips the flag.
 *
 * Composed on top of `useIsWindowVisible` so the raw visibility signal stays
 * a single source of truth.
 */
export function useIsWindowIdle(thresholdMs: number): boolean {
  const isWindowVisible = useIsWindowVisible()
  const [isIdle, setIsIdle] = useState(false)

  useEffect(() => {
    if (isWindowVisible) {
      setIsIdle(false)
      return undefined
    }
    const timer = setTimeout(() => setIsIdle(true), thresholdMs)
    return () => clearTimeout(timer)
  }, [isWindowVisible, thresholdMs])

  return isIdle
}
