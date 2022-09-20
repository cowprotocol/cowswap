import { useCallback, useEffect, useState } from 'react'

const IS_SUPPORTED = navigator.onLine !== undefined

export function isOnline() {
  return window.navigator.onLine || !IS_SUPPORTED
}

/**
 * Returns whether the window is currently visible to the user.
 */
export default function useIsOnline(): boolean {
  const [online, setOnline] = useState<boolean>(isOnline())
  const updateOnlineState = useCallback(() => {
    const onlineNew = isOnline()
    setOnline(onlineNew)
  }, [setOnline])

  useEffect(() => {
    window.addEventListener('online', updateOnlineState)
    window.addEventListener('offline', updateOnlineState)

    return () => {
      window.removeEventListener('online', updateOnlineState)
      window.removeEventListener('offline', updateOnlineState)
    }
  }, [updateOnlineState])

  return online
}
