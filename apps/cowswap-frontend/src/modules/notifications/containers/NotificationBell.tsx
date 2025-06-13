import React from 'react'

import ICON_NOTIFICATION from '@cowprotocol/assets/images/notification.svg'
import { Command } from '@cowprotocol/types'
import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

const Icon = styled.div<{ hasNotification?: boolean }>`
  --size: 18px;
  width: var(--size);
  height: var(--size);
  position: relative;
  display: ${({ theme }) => (theme.isInjectedWidgetMode ? 'none' : 'flex')};
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: auto 10px auto 8px;
  position: relative;

  &::after {
    content: '';
    --size: 8px;
    box-sizing: content-box;
    position: absolute;
    top: -3px;
    right: -4px;
    width: var(--size);
    height: var(--size);
    border-radius: var(--size);
    transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;
    border: ${({ hasNotification }) => (hasNotification ? `2px solid var(${UI.COLOR_PAPER})` : '')};
    background: ${({ hasNotification }) => (hasNotification ? `var(${UI.COLOR_DANGER})` : 'transparent')};
  }

  > svg {
    width: var(--size);
    height: var(--size);
    object-fit: contain;
    color: var(${UI.COLOR_TEXT_OPACITY_50});
    transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;

    > path {
      fill: currentColor;
    }

    &:hover {
      color: var(${UI.COLOR_TEXT});

      &::after {
        opacity: 1;
      }
    }
  }
`

interface NotificationBellProps {
  onClick: Command
  unreadCount: number
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function NotificationBell({ onClick, unreadCount }: NotificationBellProps) {
  return (
    <Icon
      hasNotification={unreadCount > 0}
      onClick={onClick}
      data-click-event={toCowSwapGtmEvent({
        category: CowSwapAnalyticsCategory.NOTIFICATIONS,
        action: 'Toggle notifications panel',
        label: `Unread count: ${unreadCount}`,
      })}
    >
      <SVG src={ICON_NOTIFICATION} />
    </Icon>
  )
}
