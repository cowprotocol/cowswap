import type { ReactNode } from 'react'

import svgCowSwapSrc from '@cowprotocol/assets/images/logo-cowswap.svg'
import { COW_SWAP_NAME } from '@cowprotocol/common-const/cowLinks'

import Link from 'next/link'

import styles from './Header.module.css'
import { HeaderMobileMenu } from './HeaderMobileMenu'
import { HeaderNav } from './HeaderNav'
import { HeaderSearch } from './HeaderSearch'
import { ProductsMenu } from './ProductsMenu'
import { SettingsMenu } from './SettingsMenu'
import { WalletBar } from './WalletBar'

import { ConnectButton } from '@/features/connect-wallet'
import { CowLogo } from '@/shared/ui/cow-logo'

export function Header(): ReactNode {
  return (
    <>
      <header className={styles.header}>
        <ProductsMenu />
        <Link className={styles.logo} href="/" aria-label={COW_SWAP_NAME}>
          <span className={styles.wordmark} style={{ maskImage: `url("${svgCowSwapSrc.src}")` }} aria-hidden="true" />
          <CowLogo className={styles.logoIcon} />
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
