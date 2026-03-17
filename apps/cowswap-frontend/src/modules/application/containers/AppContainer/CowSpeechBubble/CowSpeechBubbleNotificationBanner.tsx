import type { ReactNode } from 'react'

import type { NotificationModel } from '@cowprotocol/core'
import { UI } from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import { CowSpeechBubble } from './CowSpeechBubble'
import { Arrow } from './CowSpeechBubble.styled'

const NotificationText = styled.span`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
  text-align: left;
  word-break: break-word;
  overflow-wrap: anywhere;
`

const NotificationDescription = styled.span`
  display: block;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 14px;
  font-weight: 400;
`

const NotificationLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: currentColor;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

export interface CowSpeechBubbleNotificationBannerProps {
  currentNotification: NotificationModel | null
  onClose: () => void
}

export function CowSpeechBubbleNotificationBanner({
  currentNotification,
  onClose,
}: CowSpeechBubbleNotificationBannerProps): ReactNode {
  const { t } = useLingui()

  if (!currentNotification) {
    return null
  }

  const { title, description, url, id } = currentNotification
  const linkTarget = url && isInternal(url) ? '_parent' : '_blank'

  return (
    <CowSpeechBubble variant="notification" onClose={onClose} closeButtonAriaLabel={t`Dismiss notification`}>
      <NotificationText>
        <strong>{title}</strong>
        <NotificationDescription>{description}</NotificationDescription>
        {url && (
          <NotificationLink
            href={url}
            target={linkTarget}
            rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
            data-click-event={toCowSwapGtmEvent({
              category: CowSwapAnalyticsCategory.NOTIFICATIONS,
              action: 'Click speech bubble notification link',
              label: 'notification bubble',
              value: id,
            })}
          >
            {t`Learn more`}
            <Arrow aria-hidden="true">→</Arrow>
          </NotificationLink>
        )}
      </NotificationText>
    </CowSpeechBubble>
  )
}

function isInternal(href: string): boolean {
  if (href.startsWith('/')) return true

  try {
    return new URL(href).hostname === window.location.hostname
  } catch {
    return false
  }
}
