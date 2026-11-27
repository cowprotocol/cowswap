import type { ImageResponse } from 'next/og'

import { renderOgImage } from '@/shared/lib/seo/index.server'

export function getSiteOgImage(): ImageResponse {
  return renderOgImage({
    title: 'Tokens referencing stocks and ETFs',
    subtitle: 'From onchain issuers across chains, with swaps powered by CoW Protocol',
  })
}
