'use client'

import type { ReactNode } from 'react'

import { COOKIE_CONSENT_COPY, useCookieConsentBanner } from '@cowprotocol/analytics/consent'
import { COWSWAP_COOKIE_POLICY_LINK } from '@cowprotocol/common-const/cowLinks'

import styles from './CookieConsentBanner.module.css'

export function CookieConsentBanner(): ReactNode {
  const banner = useCookieConsentBanner()

  if (!banner.isOpen) return null

  return (
    <div className={styles.wrapper}>
      <section {...banner.dialogProps} className={styles.card} aria-label={COOKIE_CONSENT_COPY.ariaLabel}>
        {banner.isReopened && (
          <div className={styles.header}>
            <button className={styles.close} type="button" onClick={banner.close}>
              {COOKIE_CONSENT_COPY.closeLabel}
            </button>
          </div>
        )}
        <p id={banner.messageId} className={styles.message}>
          {COOKIE_CONSENT_COPY.message}{' '}
          <a href={COWSWAP_COOKIE_POLICY_LINK} target="_blank" rel="noopener noreferrer">
            {COOKIE_CONSENT_COPY.policyLinkLabel}
          </a>
        </p>
        <div className={styles.actions}>
          <button className={styles.choice} type="button" onClick={banner.reject}>
            {COOKIE_CONSENT_COPY.rejectLabel}
          </button>
          <button className={styles.choice} type="button" onClick={banner.accept}>
            {COOKIE_CONSENT_COPY.acceptLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
