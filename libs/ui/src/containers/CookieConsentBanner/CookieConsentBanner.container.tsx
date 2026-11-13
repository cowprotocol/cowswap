import { ReactNode } from 'react'

import { COOKIE_CONSENT_COPY, CookieConsentCopy, useCookieConsentBanner } from '@cowprotocol/analytics'
import svgCowCookieSrc from '@cowprotocol/assets/images/cow-cookie.svg'
import { COWSWAP_COOKIE_POLICY_LINK } from '@cowprotocol/common-const'

import * as styledEl from './CookieConsentBanner.styled'

export interface CookieConsentBannerContainerProps {
  copy?: CookieConsentCopy
  title?: string
  illustration?: ReactNode
  variant?: 'white' | 'paleBlue' | 'trading'
  /** Pixels. Height of a bar the app fixes to the bottom of the screen up to `Media.upToMedium`. Default 0 */
  bottomBarHeight?: number
}

export function CookieConsentBannerContainer({
  copy = COOKIE_CONSENT_COPY,
  title = copy.title,
  illustration = <img src={svgCowCookieSrc} alt="" />,
  variant = 'white',
  bottomBarHeight = 0,
}: CookieConsentBannerContainerProps): ReactNode {
  const banner = useCookieConsentBanner()

  if (!banner.isOpen) return null

  return (
    <styledEl.Wrapper $bottomBarHeight={bottomBarHeight}>
      <styledEl.Card {...banner.dialogProps} aria-label={copy.ariaLabel} $variant={variant}>
        {banner.isReopened && (
          <styledEl.Header>
            <styledEl.CloseButton type="button" onClick={banner.close}>
              {copy.closeLabel}
            </styledEl.CloseButton>
          </styledEl.Header>
        )}
        {(title || illustration) && (
          <styledEl.TitleRow>
            {title && <styledEl.Title>{title}</styledEl.Title>}
            {illustration && <styledEl.Illustration aria-hidden="true">{illustration}</styledEl.Illustration>}
          </styledEl.TitleRow>
        )}
        <styledEl.Message id={banner.messageId}>
          {copy.message}{' '}
          <a href={COWSWAP_COOKIE_POLICY_LINK} target="_blank" rel="noopener noreferrer">
            {copy.policyLinkLabel}
          </a>
        </styledEl.Message>
        <styledEl.Actions>
          <styledEl.ChoiceButton type="button" onClick={banner.reject}>
            {copy.rejectLabel}
          </styledEl.ChoiceButton>
          <styledEl.ChoiceButton type="button" onClick={banner.accept}>
            {copy.acceptLabel}
          </styledEl.ChoiceButton>
        </styledEl.Actions>
      </styledEl.Card>
    </styledEl.Wrapper>
  )
}
