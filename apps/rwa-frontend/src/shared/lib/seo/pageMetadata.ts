import 'server-only'

import { SITE_NAME, SITE_URL } from './site'

import type { Metadata } from 'next'

interface PageMetadataParams {
  title: string
  description: string
  /** Path under the base path, e.g. `/asset/AAPL`, `''` for the home page */
  path: string
}

/** `openGraph` and `twitter` of a page replace the root layout ones, so every page sets all their fields */
export function buildPageMetadata({ title, description, path }: PageMetadataParams): Metadata {
  const url = `${SITE_URL}${path}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_US',
      url,
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@CoWSwap',
      title,
      description,
    },
  }
}
