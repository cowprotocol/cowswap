import { ReactNode } from 'react'

import { CookieConsentCopy } from '@cowprotocol/analytics'
import { CookieConsentBannerContainer } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { MOBILE_HEADER_CONTROLS_HEIGHT_PX } from 'common/constants/common'

export function CookieConsentBanner(): ReactNode {
  const copy: CookieConsentCopy = {
    ariaLabel: t`Cookie consent`,
    message: t`By clicking “Accept All Cookies”, you agree to the storing of cookies on your device to enhance site navigation, analyze site usage, and assist in our marketing efforts.`,
    policyLinkLabel: t`Cookie policy`,
    rejectLabel: t`Reject All`,
    acceptLabel: t`Accept All Cookies`,
    closeLabel: t`Close`,
  }

  return <CookieConsentBannerContainer copy={copy} bottomBarHeight={MOBILE_HEADER_CONTROLS_HEIGHT_PX} />
}
