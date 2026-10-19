import { notFound } from 'next/navigation'

import { getAssetSeoTokensLabel } from '../lib/assetSeo'

import type { ImageResponse } from 'next/og'

import { getAssetByTicker } from '@/entities/asset/index.server'
import { renderOgImage, SITE_NAME } from '@/shared/lib/seo/index.server'

export const ASSET_OPEN_GRAPH_IMAGE_ALT = `${SITE_NAME} tokenized asset`

interface AssetOpenGraphImageProps {
  params: Promise<{ ticker: string }>
}

export async function AssetOpenGraphImage({ params }: AssetOpenGraphImageProps): Promise<ImageResponse> {
  const asset = getAssetByTicker((await params).ticker)

  if (!asset) notFound()

  return renderOgImage({ eyebrow: asset.ticker, title: asset.title, subtitle: getAssetSeoTokensLabel(asset) })
}
