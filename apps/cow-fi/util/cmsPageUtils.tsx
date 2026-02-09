import type { ReactNode } from 'react'

import { getPageBySlug } from '../services/cms'

import type { Metadata } from 'next'

import { CmsPageComponent } from '@/components/CmsPageComponent'
import { getPageMetadata } from '@/util/getPageMetadata'

/**
 * Extracts CMS slug from Next.js route segments
 * Converts route like /legal/cowswap-privacy-policy to slug 'cowswap-privacy-policy'
 */
export function extractSlugFromSegments(segments: string[]): string {
  // Take the last segment as the slug
  const slug = segments[segments.length - 1]
  if (!slug) {
    throw new Error(`No slug found in route segments: ${segments.join('/')}`)
  }
  return slug
}

/**
 * Generates metadata for a CMS page by slug
 * Throws error if page or required metadata is missing (fails build)
 */
export async function generateCmsPageMetadata(slug: string): Promise<Metadata> {
  const page = await getPageBySlug(slug)

  if (!page?.attributes) {
    throw new Error(`Page with slug "${slug}" not found in CMS`)
  }

  const { heading, description, metadata } = page.attributes
  const metaTitle = (metadata as { metaTitle?: string })?.metaTitle
  const metaDescription = (metadata as { metaDescription?: string })?.metaDescription

  const title = metaTitle || heading || description
  const desc = metaDescription || description || heading || ''

  if (!title) {
    throw new Error(`No title found for page with slug "${slug}" in CMS`)
  }

  return getPageMetadata({
    absoluteTitle: title,
    description: desc,
  })
}

/**
 * Creates a server component that renders CMS page content
 * Throws error if page or content is missing (fails build)
 */
export async function createCmsPageComponent(slug: string): Promise<ReactNode> {
  // Fetch content from CMS at build time + ISR revalidation
  const page = await getPageBySlug(slug)

  if (!page?.attributes) {
    throw new Error(`Page with slug "${slug}" not found in CMS`)
  }

  if (!page.attributes.contentSections || page.attributes.contentSections.length === 0) {
    throw new Error(`No content sections found for page with slug "${slug}"`)
  }

  // Pass the whole page data to the client component
  return <CmsPageComponent page={page} />
}
