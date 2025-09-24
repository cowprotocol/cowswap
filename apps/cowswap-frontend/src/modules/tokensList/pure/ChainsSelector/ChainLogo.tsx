import { ReactNode } from 'react'

import type { ChainInfo } from '@cowprotocol/cow-sdk'

export interface ChainLogoProps {
  chain: ChainInfo
  isDarkMode: boolean
  alt: string
}

export function ChainLogo({ chain, isDarkMode, alt }: ChainLogoProps): ReactNode {
  const src = isDarkMode ? chain.logo.dark : chain.logo.light

  return <img src={src} alt={alt} loading="lazy" />
}
