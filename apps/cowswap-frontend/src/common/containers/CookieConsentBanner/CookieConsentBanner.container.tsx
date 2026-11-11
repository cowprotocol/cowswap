import { ReactNode } from 'react'

import { CookieConsentCopy } from '@cowprotocol/analytics'
import { CookieConsentBannerContainer } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { MOBILE_HEADER_CONTROLS_HEIGHT_PX } from 'common/constants/common'

export function CookieConsentBanner(): ReactNode {
  const copy: CookieConsentCopy = {
    title: t`Cookies? Your moove.`,
    ariaLabel: t`Cookie consent`,
    message: t`You want privacy. We want to know if our ads work. Nothing tracks you until you pick.`,
    policyLinkLabel: t`Cookie policy`,
    rejectLabel: t`Reject All`,
    acceptLabel: t`Accept All`,
    closeLabel: t`Close`,
  }

  return <CookieConsentBannerContainer copy={copy} variant="cyan" bottomBarHeight={MOBILE_HEADER_CONTROLS_HEIGHT_PX} />
}
