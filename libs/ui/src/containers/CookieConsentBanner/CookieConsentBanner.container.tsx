import { ReactNode } from 'react'

import { COOKIE_CONSENT_COPY, CookieConsentCopy, useCookieConsent } from '@cowprotocol/analytics'
import { COWSWAP_COOKIE_POLICY_LINK } from '@cowprotocol/common-const'

import { CookieConsentBanner } from '../../pure/CookieConsentBanner/CookieConsentBanner.pure'

export interface CookieConsentBannerContainerProps {
  copy?: CookieConsentCopy
  /** Pixels. Height of a bar the app fixes to the bottom of the screen up to `Media.upToMedium`. Default 0 */
  bottomBarHeight?: number
}

export function CookieConsentBannerContainer({
  copy = COOKIE_CONSENT_COPY,
  bottomBarHeight,
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
      bottomBarHeight={bottomBarHeight}
    />
  )
}
