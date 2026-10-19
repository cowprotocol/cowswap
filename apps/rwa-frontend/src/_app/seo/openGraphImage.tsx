import type { ImageResponse } from 'next/og'

import { renderOgImage } from '@/shared/lib/seo/index.server'

export function getSiteOgImage(): ImageResponse {
  return renderOgImage({
    title: 'Trade tokenized stocks and ETFs',
    subtitle: 'xStocks and Ondo tokens across networks',
  })
}
