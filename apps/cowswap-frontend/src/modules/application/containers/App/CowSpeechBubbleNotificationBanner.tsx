import type { ReactNode } from 'react'

import type { NotificationModel } from '@cowprotocol/core'

import { useLingui } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import { CowSpeechBubble } from './CowSpeechBubble'

const NotificationText = styled.span`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const NotificationDescription = styled.span`
  display: block;
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
  const linkTarget = url && (url.includes(window.location.host) || url.startsWith('/')) ? '_parent' : '_blank'

  return (
    <CowSpeechBubble show onClose={onClose} closeButtonAriaLabel={t`Dismiss notification`}>
      <NotificationText>
        <strong>{title}</strong>
        <NotificationDescription>{description}</NotificationDescription>
      </NotificationText>
      {url && (
        <NotificationLink
          href={url}
          target={linkTarget}
          rel={linkTarget === '_blank' ? 'noopener noreferrer' : ''}
          data-click-event={toCowSwapGtmEvent({
            category: CowSwapAnalyticsCategory.NOTIFICATIONS,
            action: 'Click speech bubble notification link',
            label: title,
            value: id,
          })}
        >
          {t`View`}
        </NotificationLink>
      )}
    </CowSpeechBubble>
  )
}
