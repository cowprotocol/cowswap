import { ReactNode } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'
import type { ChainInfo } from '@cowprotocol/cow-sdk'

export interface ChainLogoProps {
  chain: ChainInfo
  alt: string
}

export function ChainLogo({ chain, alt }: ChainLogoProps): ReactNode {
  const { darkMode } = useTheme()
  const src = darkMode ? chain.logo.dark : chain.logo.light

  return <img src={src} alt={alt} loading="lazy" />
}
