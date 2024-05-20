import { useSetAtom } from 'jotai/index'
import React, { ReactNode, useEffect, useMemo } from 'react'

import { ListWrapper, NoNotifications, NotificationCard, NotificationsListWrapper, NotificationThumb } from './styled'

import { useAccountNotifications } from '../../hooks/useAccountNotifications'
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications'
import { markNotificationsAsReadAtom } from '../../state/readNotificationsAtom'
import { groupNotificationsByDate } from '../../utils/groupNotificationsByDate'

const DATE_FORMAT_OPTION: Intl.DateTimeFormatOptions = {
  dateStyle: 'long',
}

export function NotificationsList({ children }: { children: ReactNode }) {
  const notifications = useAccountNotifications()
  const unreadNotifications = useUnreadNotifications()
  const markNotificationsAsRead = useSetAtom(markNotificationsAsReadAtom)

  const groups = useMemo(() => (notifications ? groupNotificationsByDate(notifications) : null), [notifications])

  useEffect(() => {
    if (!notifications) return

    setTimeout(() => {
      markNotificationsAsRead(notifications.map(({ id }) => id) || [])
    }, 1000)
  }, [notifications])

  return (
    <>
      {children}
      <ListWrapper>
        {groups?.map((group) => (
          <>
            <h4>{group.date.toLocaleString(undefined, DATE_FORMAT_OPTION)}</h4>
            <NotificationsListWrapper key={group.date.getTime()}>
              {group.notifications.map(({ id, thumbnail, title, description, url }) => {
                const target = url
                  ? url.includes(window.location.host) || url.startsWith('/')
                    ? '_parent'
                    : '_blank'
                  : undefined

                return (
                  <NotificationCard
                    key={id}
                    isRead={!unreadNotifications[id]}
                    href={url || undefined}
                    target={target}
                    noImage={!thumbnail}
                    rel={target === '_blank' ? 'noopener noreferrer' : ''}
                  >
                    {thumbnail && (
                      <NotificationThumb>
                        <img src={thumbnail} alt={title} />
                      </NotificationThumb>
                    )}
                    <span>
                      <strong>{title}</strong>
                      <p>{description}</p>
                    </span>
                  </NotificationCard>
                )
              })}
            </NotificationsListWrapper>
          </>
        ))}

        {groups?.length === 0 && (
          <NoNotifications>
            <h4>Nothing new yet</h4>
            <p>As soon as anything important or interesting happens, we will definitely let you know.</p>
          </NoNotifications>
        )}
      </ListWrapper>
    </>
  )
}
