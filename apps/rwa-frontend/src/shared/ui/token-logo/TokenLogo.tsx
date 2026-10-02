import type { ReactNode } from 'react'

import Image from 'next/image'

import styles from './TokenLogo.module.css'

import { getChainLabel, getChainLogoUrl } from '@/shared/lib/chain'
import { usePrefersDarkScheme } from '@/shared/lib/theme'

const LOGO_SIZE = 28
const LARGE_LOGO_SIZE = 40
const CHAIN_BADGE_SIZE = 18

interface TokenLogoProps {
  symbol: string
  logoUrl: string | null | undefined
  /** Shows a network badge */
  chainId?: number
  size?: 'regular' | 'large'
}

export function TokenLogo({ symbol, logoUrl, chainId, size = 'regular' }: TokenLogoProps): ReactNode {
  const prefersDark = usePrefersDarkScheme()
  const chainLogoUrl = chainId === undefined ? null : getChainLogoUrl(chainId, prefersDark)
  const pixels = size === 'large' ? LARGE_LOGO_SIZE : LOGO_SIZE

  return (
    <span className={styles.wrapper} style={{ width: pixels, height: pixels }}>
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
