import type { ReactNode } from 'react'

import Link from 'next/link'

import styles from './Footer.module.css'

import { CowLogo } from '@/shared/ui/cow-logo'

const FOOTER_LOGO_HEIGHT = 17

export function Footer(): ReactNode {
  return (
    <footer className={styles.footer}>
      <div className={styles.brands}>
        <Link className={styles.brand} href="/">
          <CowLogo height={FOOTER_LOGO_HEIGHT} />
          CoW RWA
        </Link>
        <a className={styles.brand} href="https://cow.fi" target="_blank" rel="noopener noreferrer">
          <CowLogo height={FOOTER_LOGO_HEIGHT} />
          CoW Protocol
        </a>
      </div>
      <div className={styles.disclaimer}>
        <p>
          CoW RWA provides access to information concerning third-party issued tokenized assets and supported onchain
          transaction functionality. Tokenized assets are issued by independent third parties and are subject to their
          respective terms and conditions. Tokens may not confer the rights attached to the underlying assets.
        </p>
        <p>
          The availability of an asset through this interface does not constitute a recommendation or endorsement of
          that asset.
        </p>
      </div>
    </footer>
  )
}
