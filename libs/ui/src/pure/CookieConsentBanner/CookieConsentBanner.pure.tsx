import { ReactNode, useEffect, useId, useRef } from 'react'

import type { CookieConsentCopy } from '@cowprotocol/analytics'
import { useOnEscape } from '@cowprotocol/common-hooks'

import * as styledEl from './CookieConsentBanner.styled'

export interface CookieConsentBannerProps {
  copy: CookieConsentCopy
  policyHref: string
  onAccept(): void
  onReject(): void
  /** Shown when the banner is reopened from the cookie settings, after a choice was already made */
  onClose?: () => void
}

export function CookieConsentBanner({
  copy,
  policyHref,
  onAccept,
  onReject,
  onClose,
}: CookieConsentBannerProps): ReactNode {
  const messageId = useId()
  const cardRef = useRef<HTMLElement>(null)
  const isReopened = !!onClose

  useOnEscape(onClose)

  useEffect(() => {
    if (isReopened) cardRef.current?.focus()
  }, [isReopened])

  return (
    <styledEl.Wrapper>
      <styledEl.Card
        ref={cardRef}
        role="dialog"
        aria-modal="false"
        aria-label={copy.ariaLabel}
        aria-describedby={messageId}
        tabIndex={-1}
      >
        {onClose && (
          <styledEl.Header>
            <styledEl.CloseButton type="button" onClick={onClose}>
              {copy.closeLabel}
            </styledEl.CloseButton>
          </styledEl.Header>
        )}
        <styledEl.Message id={messageId}>
          {copy.message}{' '}
          <a href={policyHref} target="_blank" rel="noopener noreferrer">
            {copy.policyLinkLabel}
          </a>
        </styledEl.Message>
        <styledEl.Actions>
          <styledEl.ChoiceButton type="button" onClick={onReject}>
            {copy.rejectLabel}
          </styledEl.ChoiceButton>
          <styledEl.ChoiceButton type="button" onClick={onAccept}>
            {copy.acceptLabel}
          </styledEl.ChoiceButton>
        </styledEl.Actions>
      </styledEl.Card>
    </styledEl.Wrapper>
  )
}
