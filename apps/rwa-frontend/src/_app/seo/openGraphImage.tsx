import type { ImageResponse } from 'next/og'

import { renderOgImage, SITE_NAME } from '@/shared/lib/seo/index.server'

export const OPEN_GRAPH_IMAGE_ALT = `${SITE_NAME}: tokenized stocks and ETFs`

export function OpenGraphImage(): ImageResponse {
  return renderOgImage({
    title: 'Trade tokenized stocks and ETFs',
    subtitle: 'xStocks and Ondo tokens across networks',
  })
}
