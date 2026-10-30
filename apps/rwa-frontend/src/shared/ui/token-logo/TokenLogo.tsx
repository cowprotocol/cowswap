import type { ReactNode } from 'react'

import Image from 'next/image'

import styles from './TokenLogo.module.css'

import { getChainLabel, getChainLogoUrl } from '@/shared/lib/chain'
import { useIsDarkTheme } from '@/shared/lib/theme'

const LOGO_SIZES = { regular: 32, large: 40, hero: 56 } as const
const CHAIN_BADGE_SIZE = 16

interface TokenLogoProps {
  symbol: string
  logoUrl: string | null | undefined
  /** Shows a network badge */
  chainId?: number
  size?: keyof typeof LOGO_SIZES
}

export function TokenLogo({ symbol, logoUrl, chainId, size = 'regular' }: TokenLogoProps): ReactNode {
  const isDark = useIsDarkTheme()
  const chainLogoUrl = chainId === undefined ? null : getChainLogoUrl(chainId, isDark)
  const pixels = LOGO_SIZES[size]

  return (
    <span
      className={chainLogoUrl ? `${styles.wrapper} ${styles.withBadge}` : styles.wrapper}
      style={{ width: pixels, height: pixels }}
    >
      {logoUrl ? (
        <Image className={styles.logo} src={logoUrl} alt="" width={pixels} height={pixels} unoptimized />
      ) : (
        <span className={styles.placeholder}>{symbol.charAt(0)}</span>
      )}
      {chainId !== undefined && chainLogoUrl && (
        <Image
          className={styles.chainBadge}
          src={chainLogoUrl}
          alt={getChainLabel(chainId)}
          width={CHAIN_BADGE_SIZE}
          height={CHAIN_BADGE_SIZE}
          unoptimized
        />
      )}
    </span>
  )
}
