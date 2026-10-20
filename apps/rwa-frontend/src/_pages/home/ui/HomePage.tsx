import type { ReactNode } from 'react'

import { AssetsExplorer } from './AssetsExplorer'
import { HomeHero } from './HomeHero'
import { MarketOverview } from './MarketOverview'

import type { Metadata } from 'next'

import { SITE_URL } from '@/shared/lib/seo/index.server'

export const metadata: Metadata = { alternates: { canonical: SITE_URL } }

export function HomePage(): ReactNode {
  return (
    <>
      <HomeHero />
      <MarketOverview />
      <AssetsExplorer />
    </>
  )
}
