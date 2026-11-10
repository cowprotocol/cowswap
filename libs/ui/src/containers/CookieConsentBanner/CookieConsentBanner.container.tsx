import { ReactNode } from 'react'

import { COOKIE_CONSENT_COPY, CookieConsentCopy, useCookieConsent } from '@cowprotocol/analytics'
import { COWSWAP_COOKIE_POLICY_LINK } from '@cowprotocol/common-const'

import { CookieConsentBanner } from '../../pure/CookieConsentBanner/CookieConsentBanner.pure'

export interface CookieConsentBannerContainerProps {
  copy?: CookieConsentCopy
}

export function CookieConsentBannerContainer({
  copy = COOKIE_CONSENT_COPY,
}: CookieConsentBannerContainerProps): ReactNode {
  const { consent, isBannerOpen, acceptCookies, rejectCookies, closeCookieSettings } = useCookieConsent()

  if (!isBannerOpen) return null

  return (
    <CookieConsentBanner
      copy={copy}
      policyHref={COWSWAP_COOKIE_POLICY_LINK}
      onAccept={acceptCookies}
      onReject={rejectCookies}
      onClose={consent ? closeCookieSettings : undefined}
    />
  )
}
