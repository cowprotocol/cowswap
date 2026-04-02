import { NotificationModel } from '@cowprotocol/core'

export function isSidebarNotification(notification: NotificationModel): boolean {
  return notification.location !== 'speechBubble'
}

export function isSpeechBubbleNotification(notification: NotificationModel): boolean {
  return notification.location === 'speechBubble'
}
