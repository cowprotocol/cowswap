import type { ReactNode } from 'react'

import { notFound } from 'next/navigation'

import { AssetView } from './AssetView'

import { getAssetSeoDescription, getAssetSeoTitle } from '../lib/assetSeo'
import { buildAssetStructuredData } from '../lib/assetStructuredData'

import type { Metadata } from 'next'

import { assetQueryOptions, assetStockQueryOptions, type RwaAsset } from '@/entities/asset'
import { getAsset, getAssetByTicker, getAssets, getAssetStock, getRelatedAssets } from '@/entities/asset/index.server'
import { loadPrefetchData, type PrefetchedQuery, PrefetchedQueries } from '@/shared/lib/query-hydration'
import { buildPageMetadata, JsonLd } from '@/shared/lib/seo/index.server'

const RELATED_ASSETS_LIMIT = 6

interface AssetPageProps {
  params: Promise<{ ticker: string }>
}

export async function AssetPage({ params }: AssetPageProps): Promise<ReactNode> {
  const asset = getAssetByTicker((await params).ticker)

  if (!asset) notFound()

  return (
    <>
      <JsonLd data={buildAssetStructuredData(asset)} />
      <PrefetchedQueries queries={await prefetchAssetMarket(asset)}>
        <AssetView asset={asset} relatedAssets={getRelatedAssets(asset, getAssets(), RELATED_ASSETS_LIMIT)} />
      </PrefetchedQueries>
    </>
  )
}

/** Every listed asset, for routes prerendered from the registry alone */
export function generateAssetStaticParams(): { ticker: string }[] {
  return getAssets().map(({ ticker }) => ({ ticker }))
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

/**
 * None at build time: each page is rendered on its first request, with the market data a build-time render would make
 * every deploy request for over a thousand assets at once
 */
export function generateStaticParams(): { ticker: string }[] {
  return []
}

/** The tokenized market and the stock market, which the price, its 24h change and the About stats show */
async function prefetchAssetMarket(asset: RwaAsset): Promise<PrefetchedQuery[]> {
  const { ticker } = asset
  const [market, stock] = await Promise.all([
    loadPrefetchData(`the ${ticker} market`, () => getAsset(ticker)),
    loadPrefetchData(`the ${ticker} stock market`, () => getAssetStock(asset)),
  ])
  const queries: PrefetchedQuery[] = []

  if (market) queries.push({ queryKey: assetQueryOptions(ticker).queryKey, data: market })
  if (stock) queries.push({ queryKey: assetStockQueryOptions(ticker).queryKey, data: stock })

  return queries
}
