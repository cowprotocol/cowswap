'use client'

import { type ReactNode, useEffect, useId, useRef } from 'react'

import { COOKIE_CONSENT_COPY, useCookieConsent } from '@cowprotocol/analytics/consent'
import { COWSWAP_COOKIE_POLICY_LINK } from '@cowprotocol/common-const/cowLinks'

import styles from './CookieConsentBanner.module.css'

export function CookieConsentBanner(): ReactNode {
  const { consent, isBannerOpen, acceptCookies, rejectCookies, closeCookieSettings } = useCookieConsent()
  const messageId = useId()
  const cardRef = useRef<HTMLElement>(null)
  const isReopened = isBannerOpen && consent !== null

  useEffect(() => {
    if (!isReopened) return

    cardRef.current?.focus()

    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') closeCookieSettings()
    }

    document.addEventListener('keydown', closeOnEscape)

    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isReopened, closeCookieSettings])

  if (!isBannerOpen) return null

  return (
    <div className={styles.wrapper}>
      <section
        ref={cardRef}
        className={styles.card}
        role="dialog"
        aria-modal="false"
        aria-label={COOKIE_CONSENT_COPY.ariaLabel}
        aria-describedby={messageId}
        tabIndex={-1}
      >
        {isReopened && (
          <div className={styles.header}>
            <button className={styles.close} type="button" onClick={closeCookieSettings}>
              {COOKIE_CONSENT_COPY.closeLabel}
            </button>
          </div>
        )}
        <p id={messageId} className={styles.message}>
          {COOKIE_CONSENT_COPY.message}{' '}
          <a href={COWSWAP_COOKIE_POLICY_LINK} target="_blank" rel="noopener noreferrer">
            {COOKIE_CONSENT_COPY.policyLinkLabel}
          </a>
        </p>
        <div className={styles.actions}>
          <button className={styles.choice} type="button" onClick={rejectCookies}>
            {COOKIE_CONSENT_COPY.rejectLabel}
          </button>
          <button className={styles.choice} type="button" onClick={acceptCookies}>
            {COOKIE_CONSENT_COPY.acceptLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
