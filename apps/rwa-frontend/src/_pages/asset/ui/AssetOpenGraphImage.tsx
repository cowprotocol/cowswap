import { notFound } from 'next/navigation'

import { getAssetSeoTokensLabel } from '../lib/assetSeo'

import type { ImageResponse } from 'next/og'

import { getAssetByTicker } from '@/entities/asset/index.server'
import { renderOgImage } from '@/shared/lib/seo/index.server'

interface AssetOgImageRouteProps {
  params: Promise<{ ticker: string }>
}

export async function getAssetOgImage(_request: Request, { params }: AssetOgImageRouteProps): Promise<ImageResponse> {
  const asset = getAssetByTicker((await params).ticker)

  if (!asset) notFound()

  return renderOgImage({ eyebrow: asset.ticker, title: asset.title, subtitle: getAssetSeoTokensLabel(asset) })
}
