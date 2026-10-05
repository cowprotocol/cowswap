import type { ReactNode } from 'react'

import { PortfolioView } from './PortfolioView'

import type { Metadata } from 'next'

import { getAssetSummaries } from '@/entities/asset/index.server'

export const metadata: Metadata = { title: 'Portfolio' }

export function PortfolioPage(): ReactNode {
  return <PortfolioView assets={getAssetSummaries()} />
}
