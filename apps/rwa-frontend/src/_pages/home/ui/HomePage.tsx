import type { ReactNode } from 'react'

import { AssetsExplorer } from './AssetsExplorer'
import { HomeHero } from './HomeHero'
import { MarketOverview } from './MarketOverview'

export function HomePage(): ReactNode {
  return (
    <>
      <HomeHero />
      <MarketOverview />
      <AssetsExplorer />
    </>
  )
}
