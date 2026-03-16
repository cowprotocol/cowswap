import { useMemo } from 'react'

import { useAccountNotifications } from './useAccountNotifications'
import { useUnreadNotifications } from './useUnreadNotifications'

import { isSidebarNotification } from '../utils/filterNotifications.utils'

export function useUnreadSidebarNotificationsCount(): number {
  const notifications = useAccountNotifications()
  const unreadNotifications = useUnreadNotifications()

  return useMemo(() => {
    if (!notifications) return 0
    return notifications.filter((n) => isSidebarNotification(n) && unreadNotifications[n.id]).length
  }, [notifications, unreadNotifications])
}
