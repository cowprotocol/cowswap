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
    </footer>
  )
}
