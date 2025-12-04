import { headers } from 'next/headers'

import type { MetadataRoute } from 'next'

import { checkEnvironment } from '@/util/environment'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const { isDev } = checkEnvironment(host, '')

  // Block all indexing on develop.cow.fi
  if (isDev) {
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
