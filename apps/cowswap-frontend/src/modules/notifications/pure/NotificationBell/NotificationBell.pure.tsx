import React, { ReactNode, RefObject } from 'react'

import { Command } from '@cowprotocol/types'

import { Bell } from 'react-feather'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import * as styledEl from './NotificationBell.styled'

interface NotificationBellProps {
  ref: RefObject<HTMLButtonElement | null>
  onClick: Command
  unreadCount: number
}

export function NotificationBell({ ref, onClick, unreadCount }: NotificationBellProps): ReactNode {
  return (
    <styledEl.IconButton
      ref={ref}
      hasNotification={unreadCount > 0}
      onClick={onClick}
      data-click-event={toCowSwapGtmEvent({
        category: CowSwapAnalyticsCategory.NOTIFICATIONS,
        action: 'Toggle notifications panel',
        label: `Unread count: ${unreadCount}`,
      })}
    >
      <Bell size={20} />
    </styledEl.IconButton>
  )
}
