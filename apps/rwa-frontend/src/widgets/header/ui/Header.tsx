import type { ReactNode } from 'react'

import Link from 'next/link'

import styles from './Header.module.css'

import { ConnectButton } from '@/features/connect-wallet'

export function Header(): ReactNode {
  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <Link className={styles.logo} href="/">
          CoW RWA
        </Link>
        <ConnectButton />
      </div>
    </header>
  )
}
