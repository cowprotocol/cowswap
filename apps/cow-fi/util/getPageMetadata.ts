import type { Metadata } from 'next'
import { CONFIG } from '@/const/meta'

const metaTitleWithShortDescription = `${CONFIG.title.default} - ${CONFIG.descriptionShort}`
const metaTitleWithDescription = `${CONFIG.title.default} - ${CONFIG.description}`

export function getPageMetadata({
  title,
  absoluteTitle,
  description,
  image = CONFIG.ogImage,
}: {
  title?: string
  absoluteTitle?: string
  description: string
  image?: string
}): Metadata {
  const pageTitle = absoluteTitle || title || metaTitleWithDescription

  return {
    title: absoluteTitle
      ? {
          absolute: pageTitle,
        }
      : pageTitle || '',
    description,
    twitter: {
      card: 'summary_large_image',
      title: absoluteTitle || title || metaTitleWithShortDescription,
      description,
      images: [image],
    },
    openGraph: {
      type: 'website',
      title: pageTitle,
      description,
      images: [image],
    },
  }
}
