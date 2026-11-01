import type { ReactNode } from 'react'

import { PortfolioView } from './PortfolioView'

import type { Metadata } from 'next'

import { getAssetSummaries } from '@/entities/asset/index.server'
import { buildPageMetadata } from '@/shared/lib/seo/index.server'

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: 'Portfolio',
    description: 'Your holdings of tokens referencing stocks and ETFs, open orders and trades across networks.',
    path: '/portfolio',
  }),
  // The content depends on the connected wallet
  robots: { index: false, follow: true },
}

export function PortfolioPage(): ReactNode {
  return <PortfolioView assets={getAssetSummaries()} />
}
