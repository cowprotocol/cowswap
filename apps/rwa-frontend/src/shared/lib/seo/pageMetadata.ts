import 'server-only'

import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from './ogImage'
import { DEPLOYMENT_URL, SITE_NAME, SITE_URL } from './site'

import type { Metadata } from 'next'

interface PageImage {
  /** Path under the base path, e.g. `/asset/AAPL/og-image` */
  path: string
  alt: string
}

interface PageMetadataParams {
  title: string
  description: string
  /** Path under the base path, e.g. `/asset/AAPL`, `''` for the home page */
  path: string
  image?: PageImage
}

export const SITE_IMAGE: PageImage = { path: '/og-image', alt: `${SITE_NAME}: tokenized stocks and ETFs` }

/**
 * `openGraph` and `twitter` of a page replace the root layout ones, so every page sets all their fields.
 * Images are absolute URLs: Next.js resolves relative ones on Vercel previews against the branch URL without the base path.
 */
export function buildPageMetadata({ title, description, path, image = SITE_IMAGE }: PageMetadataParams): Metadata {
  const url = `${SITE_URL}${path}`
  const images = [
    { url: `${DEPLOYMENT_URL}${image.path}`, alt: image.alt, type: OG_IMAGE_CONTENT_TYPE, ...OG_IMAGE_SIZE },
  ]

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
      images,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@CoWSwap',
      title,
      description,
      images,
    },
  }
}
