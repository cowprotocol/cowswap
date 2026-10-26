import type { ReactNode } from 'react'

import { notFound } from 'next/navigation'

import { AssetView } from './AssetView'

import { getAssetSeoDescription, getAssetSeoTitle } from '../lib/assetSeo'

import type { Metadata } from 'next'

import { getAssetByTicker, getAssets } from '@/entities/asset/index.server'
import { buildPageMetadata } from '@/shared/lib/seo/index.server'

interface AssetPageProps {
  params: Promise<{ ticker: string }>
}

export async function AssetPage({ params }: AssetPageProps): Promise<ReactNode> {
  const asset = getAssetByTicker((await params).ticker)

  if (!asset) notFound()

  return <AssetView asset={asset} />
}

export async function generateMetadata({ params }: AssetPageProps): Promise<Metadata> {
  const asset = getAssetByTicker((await params).ticker)

  if (!asset) return { title: 'Asset not found' }

  return buildPageMetadata({
    title: getAssetSeoTitle(asset),
    description: getAssetSeoDescription(asset),
    path: `/asset/${asset.ticker}`,
    image: { path: `/asset/${asset.ticker}/og-image`, alt: `${asset.title} (${asset.ticker})` },
  })
}

export function generateStaticParams(): { ticker: string }[] {
  return getAssets().map(({ ticker }) => ({ ticker }))
}
