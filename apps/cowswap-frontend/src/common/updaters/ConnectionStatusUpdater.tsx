import { useCallback, useEffect, useRef } from 'react'

import { useIsOnline } from '@cowprotocol/common-hooks'
import { useAddSnackbar, useRemoveSnackbar, SnackbarItem } from '@cowprotocol/snackbars'
import { UI } from '@cowprotocol/ui'

import { AlertTriangle } from 'react-feather'
import styled from 'styled-components/macro'

const OfflineIcon = styled(AlertTriangle)`
  color: var(${UI.COLOR_DANGER});
`

const OFFLINE_NOTIFICATION_ID = 'offline-connection'
const NOTIFICATION_REFRESH_INTERVAL = 60000 // 1 minute
const NOTIFICATION_DURATION = NOTIFICATION_REFRESH_INTERVAL + 10000 // Slightly longer than refresh interval

/**
 * Creates a standardized offline notification object
 */
const createOfflineNotification = (): SnackbarItem => ({
  id: OFFLINE_NOTIFICATION_ID,
  icon: 'custom',
  customIcon: <OfflineIcon size={24} />,
  content: (
    <div>
      <strong>Connection Lost</strong>
      <br />
      You appear to be offline. Some features may not work properly.
    </div>
  ),
  duration: NOTIFICATION_DURATION,
})

/**
 * Custom hook to manage offline notifications with proper cleanup and no race conditions
 */
function useOfflineNotification(): void {
  const isOnline = useIsOnline()
  const addSnackbar = useAddSnackbar()
  const removeSnackbar = useRemoveSnackbar()
  const refreshTimerRef = useRef<number | null>(null)

  const clearTimer = useCallback((): void => {
    if (refreshTimerRef.current !== null) {
      clearInterval(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isOnline) {
      // Show initial notification
      addSnackbar(createOfflineNotification())

      // Set up refresh timer to keep notification alive
      clearTimer() // Ensure no existing timer
      refreshTimerRef.current = window.setInterval(() => {
        // Use fresh navigator.onLine check to avoid stale closures
        if (!navigator.onLine) {
          addSnackbar(createOfflineNotification())
        }
      }, NOTIFICATION_REFRESH_INTERVAL)
    } else {
      // Clear timer and remove notification when back online
      clearTimer()
      removeSnackbar(OFFLINE_NOTIFICATION_ID)
    }

    // Cleanup on unmount or dependency change
    return clearTimer
  }, [isOnline, addSnackbar, removeSnackbar, clearTimer])
}

/**
 * Component that monitors connection status and displays notifications when offline.
 * Returns null as it's a purely side-effect component.
 */
export function ConnectionStatusUpdater(): null {
  useOfflineNotification()
  return null
}