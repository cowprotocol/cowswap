import { useCallback, useEffect, useState } from 'react'

function isVisibilityStateSupported(): boolean {
  return typeof document !== 'undefined' && 'visibilityState' in document
}

function isWindowVisible(): boolean {
  if (typeof document === 'undefined') return false
  return !isVisibilityStateSupported() || document.visibilityState !== 'hidden'
}

/**
 * Returns whether the window is currently visible to the user.
 */
export function useIsWindowVisible(): boolean {
  const [focused, setFocused] = useState<boolean>(() => isWindowVisible())
  const listener = useCallback(() => {
    setFocused(isWindowVisible())
  }, [setFocused])

  useEffect(() => {
    if (!isVisibilityStateSupported()) return undefined
    setFocused(isWindowVisible())

    document.addEventListener('visibilitychange', listener)
    return () => {
      document.removeEventListener('visibilitychange', listener)
    }
  }, [listener])

  return focused
}
