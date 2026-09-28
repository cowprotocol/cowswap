import type { ReactNode } from 'react'

import Link from 'next/link'

import { ConnectButton } from './ConnectButton'
import styles from './Header.module.css'

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
