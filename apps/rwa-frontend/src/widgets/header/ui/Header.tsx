import type { ReactNode } from 'react'

import Link from 'next/link'

import styles from './Header.module.css'
import { HeaderNav } from './HeaderNav'
import { HeaderSearch } from './HeaderSearch'
import { ThemeSwitcher } from './ThemeSwitcher'

import { ConnectButton } from '@/features/connect-wallet'
import { CowLogo } from '@/shared/ui/cow-logo'

export function Header(): ReactNode {
  return (
    <header className={styles.header}>
      <Link className={styles.logo} href="/">
        <CowLogo />
        CoW RWA
      </Link>
      <HeaderNav />
      <div className={styles.search}>
        <HeaderSearch />
      </div>
      <ConnectButton />
      <ThemeSwitcher />
    </header>
  )
}
