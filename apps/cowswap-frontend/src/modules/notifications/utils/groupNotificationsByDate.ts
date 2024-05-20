import { getDateTimestamp } from '@cowprotocol/common-utils'

import { NotificationModel } from '../types'

type NotificationByDate = {
  date: Date
  notifications: NotificationModel[]
}[]

export function groupNotificationsByDate(notifications: NotificationModel[]): NotificationByDate {
  const mapByTimestamp: { [timestamp: number]: NotificationModel[] } = {}

  notifications.forEach((notification) => {
    const { createdAt } = notification

    const timestamp = getDateTimestamp(new Date(createdAt))

    mapByTimestamp[timestamp] = (mapByTimestamp[timestamp] || []).concat(notification)
  })

  return Object.keys(mapByTimestamp)
    .map((strTimestamp) => {
      const timestamp = Number(strTimestamp)
      return {
        date: new Date(timestamp),
        notifications: mapByTimestamp[timestamp].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      }
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())
}
