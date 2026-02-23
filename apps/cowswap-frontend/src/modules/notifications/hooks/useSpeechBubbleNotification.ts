import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import type { NotificationModel } from '@cowprotocol/core'

import { useUnreadNotifications } from 'modules/notifications/hooks/useUnreadNotifications'
import { markNotificationsAsReadCloneArrayAtom } from 'modules/notifications/state/readNotificationsAtom'
import { isSidebarNotification } from 'modules/notifications/utils/filterNotifications.utils'

import { useAccountNotifications } from './useAccountNotifications'

export function useSpeechBubbleNotification(): {
  currentNotification: NotificationModel | null
  dismiss: () => void
} {
  const notifications = useAccountNotifications()
  const unreadNotifications = useUnreadNotifications()
  const markNotificationsAsRead = useSetAtom(markNotificationsAsReadCloneArrayAtom)

  const speechBubbleNotifications = useMemo(() => {
    if (!notifications) return []

    return (notifications || [])
      .filter(isSidebarNotification)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [notifications])

  const currentNotification = useMemo(() => {
    if (!speechBubbleNotifications) return null

    return speechBubbleNotifications.find(({ id }) => unreadNotifications[id]) || null
  }, [speechBubbleNotifications, unreadNotifications])

  const dismiss = useCallback(() => {
    if (!currentNotification) return

    markNotificationsAsRead([currentNotification.id])
  }, [currentNotification, markNotificationsAsRead])

  return { currentNotification, dismiss }
}
