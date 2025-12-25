import { useSetAtom } from 'jotai'
import React, { ReactNode, useEffect, useMemo } from 'react'

import ICON_MESSAGE_READ from '@cowprotocol/assets/images/icon-message-read.svg'

import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react/macro'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { DATE_FORMAT_OPTION } from 'common/constants/dateFormats'

import {
  ListWrapper,
  NoNotifications,
  NotificationCard,
  NotificationsListWrapper,
  NotificationThumb,
  MessageReadIcon,
  EnableAlertsLink,
} from './styled'

import { NOTIFICATION_MARK_READ_DELAY_MS } from '../../constants'
import { useAccountNotifications } from '../../hooks/useAccountNotifications'
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications'
import { markNotificationsAsReadAtom } from '../../state/readNotificationsAtom'
import { groupNotificationsByDate } from '../../utils/groupNotificationsByDate'

interface EmptyNotificationsProps {
  hasSubscription: boolean | undefined
  onToggleSettings: (() => void) | undefined
}

function EmptyNotifications({ hasSubscription, onToggleSettings }: EmptyNotificationsProps): ReactNode {
  return (
    <NoNotifications>
      <MessageReadIcon src={ICON_MESSAGE_READ} />
      <h4>
        <Trans>You're all caught up</Trans>
      </h4>
      {!hasSubscription && onToggleSettings && (
        <p>
          <Trans>
            <EnableAlertsLink
              onClick={onToggleSettings}
              data-click-event={toCowSwapGtmEvent({
                category: CowSwapAnalyticsCategory.NOTIFICATIONS,
                action: 'Enable trade alerts',
                label: 'empty state link',
              })}
            >
              Enable trade alerts
            </EnableAlertsLink>{' '}
            for fills and expiries
          </Trans>
        </p>
      )}
    </NoNotifications>
  )
}

interface NotificationsListProps {
  children: ReactNode
  hasSubscription: boolean | undefined
  onToggleSettings: (() => void) | undefined
}

// TODO: Break down this large function into smaller functions
export function NotificationsList({ children, hasSubscription, onToggleSettings }: NotificationsListProps): ReactNode {
  const notifications = useAccountNotifications()
  const unreadNotifications = useUnreadNotifications()
  const markNotificationsAsRead = useSetAtom(markNotificationsAsReadAtom)

  const groups = useMemo(() => (notifications ? groupNotificationsByDate(notifications) : null), [notifications])

  useEffect(() => {
    if (!notifications) return

    const timeoutId = setTimeout(() => {
      markNotificationsAsRead(notifications.map(({ id }) => id) || [])
    }, NOTIFICATION_MARK_READ_DELAY_MS)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [notifications, markNotificationsAsRead])

  return (
    <>
      {children}
      <ListWrapper>
        {groups?.map((group) => (
          <>
            <h4>{group.date.toLocaleString(i18n.locale, DATE_FORMAT_OPTION)}</h4>
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
                    data-click-event={toCowSwapGtmEvent({
                      category: CowSwapAnalyticsCategory.NOTIFICATIONS,
                      action: 'Click Notification Card',
                      label: title,
                      value: id,
                    })}
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
          <EmptyNotifications hasSubscription={hasSubscription} onToggleSettings={onToggleSettings} />
        )}
      </ListWrapper>
    </>
  )
}
