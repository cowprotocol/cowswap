import { atom } from 'jotai'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

export interface NotificationSidebarState {
  isOpen: boolean
  initialSettingsOpen: boolean
}

export const { atom: notificationSidebarStateAtom, updateAtom: updateNotificationSidebarStateAtom } =
  atomWithPartialUpdate(atom<NotificationSidebarState>({ isOpen: false, initialSettingsOpen: false }))
