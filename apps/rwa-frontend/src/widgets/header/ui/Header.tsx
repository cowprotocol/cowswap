import type { ReactNode } from 'react'

import Link from 'next/link'

import styles from './Header.module.css'
import { HeaderNav } from './HeaderNav'
import { HeaderSearch } from './HeaderSearch'

import { ConnectButton } from '@/features/connect-wallet'

export function Header(): ReactNode {
  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <div className={styles.start}>
          <Link className={styles.logo} href="/">
            CoW RWA
          </Link>
          <HeaderNav />
        </div>
        <div className={styles.search}>
          <HeaderSearch />
        </div>
        <ConnectButton />
      </div>
    </header>
  )
}
