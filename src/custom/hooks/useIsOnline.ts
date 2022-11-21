import { useCallback, useEffect, useState } from 'react'
import { getTimeoutAbortController } from '@cow/utils/request'
import ms from 'ms.macro'

const CONNECTIVITY_CHECK_POLLING_TIME = ms`30s`
const CONNECTIVITY_CHECK_TIMEOUT = ms`15s`
const IS_SUPPORTED = navigator.onLine !== undefined

export function isOnline() {
  return window.navigator.onLine || !IS_SUPPORTED
}

/**
 * Checks if there is network connectivity.
 * Relying on navigator.onLine is not enough, as empirically saw with some user complaints.
 * There's some threads with Chrome experiencing this issue, see https://dev.to/maxmonteil/is-your-app-online-here-s-how-to-reliably-know-in-just-10-lines-of-js-guide-3in7
 *
 * This method runs a test of doing a HEAD HTTP request
 *
 *
 * @returns true if we have connectivity, false otherwise
 */
export async function hasConnectivity(): Promise<boolean> {
  try {
    const response = await fetch(window.location.origin, {
      method: 'HEAD',
      signal: getTimeoutAbortController(CONNECTIVITY_CHECK_TIMEOUT).signal,
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Returns whether the window is currently visible to the user.
 */
export default function useIsOnline(): boolean {
  const [online, setOnline] = useState<boolean>(isOnline())

  // Double-check if we REALLY don't have connectivity when the browser says so (There's cases where `online = false` flag might be not true)
  useEffect(() => {
    let isCancelled = false

    async function checkConnectivity() {
      const connected = await hasConnectivity()

      if (isCancelled) {
        // Discard theconnectivity check result
        return
      }

      if (connected) {
        // The browser reports offline, but we observe we are online
        setOnline(true)
      } else {
        // Schedule a test for later
        setTimeout(checkConnectivity, CONNECTIVITY_CHECK_POLLING_TIME)
      }
    }

    if (!online) {
      checkConnectivity()
    }

    return function cleanup() {
      isCancelled = true
    }
  }, [online])

  // Update the online status purely base on the browser info
  const updateOnlineState = useCallback(() => {
    const onlineNew = isOnline()
    setOnline(onlineNew)
  }, [setOnline])

  // Subscribe to changes of online/offline status
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
