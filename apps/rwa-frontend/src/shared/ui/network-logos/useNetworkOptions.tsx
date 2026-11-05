import Image from 'next/image'

import styles from './NetworkLogos.module.css'

import type { SelectOption } from '@/shared/ui/select'

import { getChainLabel, getChainLogoUrl } from '@/shared/lib/chain'
import { useIsDarkTheme } from '@/shared/lib/theme'

/** `Select` options of `chainIds`, labelled with the chain name and its logo of `logoSize` pixels */
export function useNetworkOptions(chainIds: number[], logoSize = 16): SelectOption<number>[] {
  const isDark = useIsDarkTheme()

  return chainIds.map((chainId) => {
    const logoUrl = getChainLogoUrl(chainId, isDark)

    return {
      value: chainId,
      label: getChainLabel(chainId),
      icon: logoUrl && (
        <Image className={styles.optionLogo} src={logoUrl} alt="" width={logoSize} height={logoSize} unoptimized />
      ),
    }
  })
}
