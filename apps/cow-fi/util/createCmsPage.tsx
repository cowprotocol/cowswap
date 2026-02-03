import type { ReactNode } from 'react'

import type { Metadata } from 'next'

import { generateCmsPageMetadata, createCmsPageComponent as createCmsPageComponentUtil } from '@/util/cmsPageUtils'

/**
 * Creates a complete CMS page with both component and metadata
 *
 * Usage:
 * const { default: Page, generateMetadata } = createCmsPage('cowswap-privacy-policy')
 * export { Page as default, generateMetadata }
 * export const revalidate = 43200
 *
 * OR even better:
 * export const { default: Page, generateMetadata } = createCmsPage('cowswap-privacy-policy')
 * export { Page as default, generateMetadata }
 * export const revalidate = 43200
 */
export function createCmsPage(cmsSlug: string): {
  default: () => Promise<ReactNode>
  generateMetadata: () => Promise<Metadata>
} {
  return {
    default: async (): Promise<ReactNode> => {
      return createCmsPageComponentUtil(cmsSlug)
    },
    generateMetadata: async (): Promise<Metadata> => {
      return generateCmsPageMetadata(cmsSlug)
    },
  }
}
