import type { ReactNode } from 'react'

import Image from 'next/image'

import styles from './NetworkLogos.module.css'

import { getChainLabel, getChainLogoUrl } from '@/shared/lib/chain'
import { useIsDarkTheme } from '@/shared/lib/theme'

const NETWORK_LOGO_SIZE = 16

const networksFormatter = new Intl.ListFormat('en', { type: 'conjunction' })

export function NetworkLogos({ chainIds }: { chainIds: number[] }): ReactNode {
  const isDark = useIsDarkTheme()
  const logos = chainIds.flatMap((chainId) => {
    const logoUrl = getChainLogoUrl(chainId, isDark)

    return logoUrl ? [{ chainId, logoUrl }] : []
  })

  if (!logos.length) return null

  return (
    <span className={styles.networks}>
      {logos.map(({ chainId, logoUrl }) => (
        <Image
          key={chainId}
          className={styles.logo}
          src={logoUrl}
          alt=""
          width={NETWORK_LOGO_SIZE}
          height={NETWORK_LOGO_SIZE}
          unoptimized
        />
      ))}
      <span className={styles.visuallyHidden}>
        on {networksFormatter.format(logos.map(({ chainId }) => getChainLabel(chainId)))}
      </span>
    </span>
  )
}
