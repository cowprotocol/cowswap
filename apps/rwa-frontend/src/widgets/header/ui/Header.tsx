import type { ReactNode } from 'react'

import Link from 'next/link'

import styles from './Header.module.css'
import { HeaderMobileMenu } from './HeaderMobileMenu'
import { HeaderNav } from './HeaderNav'
import { HeaderSearch } from './HeaderSearch'
import { SettingsMenu } from './SettingsMenu'
import { WalletBar } from './WalletBar'

import { ConnectButton } from '@/features/connect-wallet'
import { CowLogo } from '@/shared/ui/cow-logo'

export function Header(): ReactNode {
  return (
    <>
      <header className={styles.header}>
        <Link className={styles.logo} href="/" aria-label="CoW RWA">
          <CowLogo />
          <span className={styles.logoText}>CoW RWA</span>
        </Link>
        <HeaderNav />
        <div className={styles.search}>
          <HeaderSearch />
        </div>
        <div className={styles.wallet}>
          <ConnectButton />
        </div>
        <SettingsMenu />
        <HeaderMobileMenu />
      </header>
      <WalletBar />
    </>
  )
}
