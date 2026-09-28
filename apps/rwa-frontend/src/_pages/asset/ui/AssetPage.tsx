import type { ReactNode } from 'react'

import { notFound } from 'next/navigation'

import { AssetView } from './AssetView'

import type { Metadata } from 'next'

import { getAssetByTicker, getAssets } from '@/entities/asset/index.server'

interface AssetPageProps {
  params: Promise<{ ticker: string }>
}

export async function AssetPage({ params }: AssetPageProps): Promise<ReactNode> {
  const asset = getAssetByTicker((await params).ticker)

  if (!asset) notFound()

  return <AssetView ticker={asset.ticker} />
}

export async function generateMetadata({ params }: AssetPageProps): Promise<Metadata> {
  const asset = getAssetByTicker((await params).ticker)

  return { title: asset ? `${asset.title} (${asset.ticker})` : 'Asset not found' }
}

export function generateStaticParams(): { ticker: string }[] {
  return getAssets().map(({ ticker }) => ({ ticker }))
}
