import { useCallback, useEffect, useState } from 'react'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function isVisibilityStateSupported() {
  return 'visibilityState' in document
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function isWindowVisible() {
  return !isVisibilityStateSupported() || document.visibilityState !== 'hidden'
}

/**
 * Returns whether the window is currently visible to the user.
 */
export function useIsWindowVisible(): boolean {
  const [focused, setFocused] = useState<boolean>(false)
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
