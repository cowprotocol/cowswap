'use client'

import type { ReactNode } from 'react'

import { COOKIE_CONSENT_COPY, useCookieConsentBanner } from '@cowprotocol/analytics/consent'
import svgCowCookieSrc from '@cowprotocol/assets/images/cow-cookie.svg'
import { COWSWAP_COOKIE_POLICY_LINK } from '@cowprotocol/common-const/cowLinks'

import Image from 'next/image'

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
        <div className={styles.titleRow}>
          <h2 className={styles.title}>{COOKIE_CONSENT_COPY.title}</h2>
          <div className={styles.illustration} aria-hidden="true">
            <Image src={svgCowCookieSrc} alt="" width={96} height={80} loading="eager" unoptimized />
          </div>
        </div>
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
