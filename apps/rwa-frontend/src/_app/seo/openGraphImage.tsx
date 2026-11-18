import type { ImageResponse } from 'next/og'

import { STOCKS_PAGE_HEADING } from '@/shared/config'
import { renderOgImage } from '@/shared/lib/seo/index.server'

export function getSiteOgImage(): ImageResponse {
  return renderOgImage({
    title: STOCKS_PAGE_HEADING,
    subtitle: 'From independent issuers across chains, with swaps powered by CoW Protocol',
  })
}
