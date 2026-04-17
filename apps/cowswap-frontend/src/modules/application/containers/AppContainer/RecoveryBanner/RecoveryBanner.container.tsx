import { type ReactNode, useCallback, useEffect, useRef } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useLocation } from 'react-router'

import { RECOVERY_BANNER_FLAG, RECOVERY_BANNER_REVOKE_URL } from './RecoveryBanner.constants'
import * as styledEl from './RecoveryBanner.styled'
import { useRecoveryBanner } from './useRecoveryBanner'

const RECOVERY_BANNER_ANALYTICS_EVENT = {
  dismissed: 'recovery_banner_dismissed',
  linkClicked: 'recovery_banner_link_clicked',
  shown: 'recovery_banner_shown',
} as const

export function RecoveryBanner(): ReactNode {
  const { pathname } = useLocation()
  const { isVisible, dismiss } = useRecoveryBanner()
  const { [RECOVERY_BANNER_FLAG]: isRecoveryBannerEnabled } = useFeatureFlags()
  const cowAnalytics = useCowAnalytics()
  const lastTrackedPathRef = useRef<string | null>(null)

  const shouldRender = Boolean(isRecoveryBannerEnabled) && isVisible && !isInjectedWidget()

  const sendAnalyticsEvent = useCallback(
    (eventName: string, additionalParams?: Record<string, string>): void => {
      cowAnalytics.sendEvent(eventName, additionalParams)
    },
    [cowAnalytics],
  )

  useEffect(() => {
    if (!shouldRender) {
      lastTrackedPathRef.current = null
      return
    }

    if (lastTrackedPathRef.current === pathname) {
      return
    }

    lastTrackedPathRef.current = pathname
    sendAnalyticsEvent(RECOVERY_BANNER_ANALYTICS_EVENT.shown)
  }, [pathname, sendAnalyticsEvent, shouldRender])

  const handleDismiss = useCallback(() => {
    sendAnalyticsEvent(RECOVERY_BANNER_ANALYTICS_EVENT.dismissed)
    dismiss()
  }, [dismiss, sendAnalyticsEvent])

  const handleRevokeClick = useCallback(() => {
    sendAnalyticsEvent(RECOVERY_BANNER_ANALYTICS_EVENT.linkClicked, { linkTarget: 'revokeCash' })
  }, [sendAnalyticsEvent])

  if (!shouldRender) {
    return null
  }

  return (
    <styledEl.Banner data-testid="recovery-banner">
      <styledEl.IconWrap aria-hidden="true">
        <styledEl.Icon />
      </styledEl.IconWrap>

      <styledEl.Content>
        <styledEl.Title>
          <Trans>
            CoW Swap <styledEl.TitleAccent>is back online</styledEl.TitleAccent>
          </Trans>
        </styledEl.Title>

        <styledEl.Description>
          <Trans>
            A recent DNS incident has been resolved. CoW Swap contracts remain safe. If you interacted with the site on
            April 14, review your token approvals on{' '}
            <styledEl.Link href={RECOVERY_BANNER_REVOKE_URL} onClickOptional={handleRevokeClick}>
              Revoke.cash
            </styledEl.Link>
            .
          </Trans>
        </styledEl.Description>
      </styledEl.Content>

      <styledEl.CloseButton type="button" aria-label={t`Dismiss incident notice`} onClick={handleDismiss}>
        <styledEl.CloseIcon aria-hidden="true" />
      </styledEl.CloseButton>
    </styledEl.Banner>
  )
}
