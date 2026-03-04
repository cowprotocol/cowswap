import { useSetAtom } from 'jotai'
import { useCallback, useMemo, useState } from 'react'

import type { NotificationModel } from '@cowprotocol/core'

import { useAccountNotifications } from './useAccountNotifications'
import { useUnreadNotifications } from './useUnreadNotifications'

import { markNotificationsAsReadCloneArrayAtom } from '../state/readNotificationsAtom'
import { isSpeechBubbleNotification } from '../utils/filterNotifications.utils'

const FORCE_SPEECH_BUBBLE_NOTIFICATION =
  process.env.NODE_ENV === 'development' && process.env.REACT_APP_FORCE_SPEECH_BUBBLE_NOTIFICATION === 'true'

const FORCED_SPEECH_BUBBLE_NOTIFICATION: NotificationModel = {
  id: -999_999,
  account: 'debug',
  title: 'Debug speech bubble notification',
  description:
    'This message is forced in development mode. Set REACT_APP_FORCE_SPEECH_BUBBLE_NOTIFICATION=false to disable.',
  createdAt: '2099-01-01T00:00:00.000Z',
  url: '/#/swap',
  thumbnail: null,
  location: 'speechBubble',
}

export function useSpeechBubbleNotification(): {
  currentNotification: NotificationModel | null
  dismiss: () => void
} {
  const notifications = useAccountNotifications()
  const unreadNotifications = useUnreadNotifications()
  const markNotificationsAsRead = useSetAtom(markNotificationsAsReadCloneArrayAtom)
  const [isForcedNotificationDismissed, setIsForcedNotificationDismissed] = useState(false)

  const speechBubbleNotifications = useMemo(() => {
    return (notifications || [])
      .filter(isSpeechBubbleNotification)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [notifications])

  const currentNotification = useMemo(() => {
    if (FORCE_SPEECH_BUBBLE_NOTIFICATION && !isForcedNotificationDismissed) {
      return FORCED_SPEECH_BUBBLE_NOTIFICATION
    }

    return speechBubbleNotifications.find(({ id }) => unreadNotifications[id]) || null
  }, [isForcedNotificationDismissed, speechBubbleNotifications, unreadNotifications])

  const dismiss = useCallback(() => {
    if (FORCE_SPEECH_BUBBLE_NOTIFICATION) {
      setIsForcedNotificationDismissed(true)
      return
    }

    if (!currentNotification) return

    markNotificationsAsRead([currentNotification.id])
  }, [currentNotification, markNotificationsAsRead])

  return useMemo(() => ({ currentNotification, dismiss }), [currentNotification, dismiss])
}
