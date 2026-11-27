import type { ReactNode } from 'react'

import Image from 'next/image'

import styles from './AccountTable.module.css'

import { getChainLabel, getChainLogoUrl } from '@/shared/lib/chain'
import { useIsDarkTheme } from '@/shared/lib/theme'

const CHAIN_LOGO_SIZE = 14

export function ChainLabel({ chainId }: { chainId: number }): ReactNode {
  const logoUrl = getChainLogoUrl(chainId, useIsDarkTheme())

  return (
    <span className={styles.inlineLogo}>
      {logoUrl && <Image src={logoUrl} alt="" width={CHAIN_LOGO_SIZE} height={CHAIN_LOGO_SIZE} unoptimized />}
      {getChainLabel(chainId)}
    </span>
  )
}
