import type { MetadataRoute } from 'next'

import { checkEnvironment } from '@/util/environment'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { isDev, isPr } = checkEnvironment()

  // Block all indexing on develop.cow.fi and PR preview environments
  if (isDev || isPr) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  // Allow indexing on production
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cow.fi'}/sitemap.xml`,
  }
}
