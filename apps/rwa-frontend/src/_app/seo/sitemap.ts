import type { MetadataRoute } from 'next'

import { getAssets, getRegistry } from '@/entities/asset/index.server'
import { SITE_URL } from '@/shared/lib/seo/index.server'

export function sitemap(): MetadataRoute.Sitemap {
  const registryModified = new Date(getRegistry().lastModificationTime)

  return [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    ...getAssets().map(({ ticker }) => ({
      url: `${SITE_URL}/asset/${ticker}`,
      lastModified: registryModified,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
  ]
}
