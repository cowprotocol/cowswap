import { MANIFEST_ICONS } from '../seo'

import type { MetadataRoute } from 'next'

import { BASE_PATH } from '@/shared/config'
import { SITE_DESCRIPTION, SITE_NAME } from '@/shared/lib/seo/index.server'

export function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    id: BASE_PATH,
    start_url: BASE_PATH,
    scope: BASE_PATH,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#052b65',
    icons: MANIFEST_ICONS.map(({ url, sizes, type }) => ({ src: url, sizes, type })),
  }
}
