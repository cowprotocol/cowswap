import type { ReactNode } from 'react'

import Image from 'next/image'

import styles from './NetworkLogos.module.css'

import { getChainLabel, getChainLogoUrl } from '@/shared/lib/chain'
import { useIsDarkTheme } from '@/shared/lib/theme'
import { Tooltip } from '@/shared/ui/tooltip'

const NETWORK_LOGO_SIZE = 16

export function NetworkLogos({ chainIds }: { chainIds: number[] }): ReactNode {
  const isDark = useIsDarkTheme()

  return (
    <span className={styles.networks}>
      {chainIds.map((chainId) => {
        const logoUrl = getChainLogoUrl(chainId, isDark)
        const label = getChainLabel(chainId)

        return logoUrl ? (
          <Tooltip key={chainId} className={styles.logo} content={label}>
            <Image src={logoUrl} alt={label} width={NETWORK_LOGO_SIZE} height={NETWORK_LOGO_SIZE} unoptimized />
          </Tooltip>
        ) : null
      })}
    </span>
  )
}
