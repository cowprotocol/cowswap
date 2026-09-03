import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { notificationSidebarStateAtom, updateNotificationSidebarStateAtom } from '../state/notificationSidebarState'

import type { NotificationSidebarState } from '../state/notificationSidebarState'

export function useCloseNotificationSidebar(): () => void {
  const updateState = useSetAtom(updateNotificationSidebarStateAtom)

  return useCallback(() => updateState({ isOpen: false, initialSettingsOpen: false }), [updateState])
}

export function useNotificationSidebarState(): NotificationSidebarState {
  return useAtomValue(notificationSidebarStateAtom)
}

/**
 * Opens the notification sidebar from anywhere in the app (e.g. from the order-submitted screen).
 */
export function useOpenNotificationSidebar(): (openSettings?: boolean) => void {
  const updateState = useSetAtom(updateNotificationSidebarStateAtom)

  return useCallback(
    (openSettings = false) => updateState({ isOpen: true, initialSettingsOpen: openSettings }),
    [updateState],
  )
}
