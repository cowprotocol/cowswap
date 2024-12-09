import type { Metadata } from 'next'

export function getPageMetadata({
  title,
  description,
  image,
}: {
  title: string
  description: string
  image?: string
}): Metadata {
  return {
    title,
    description,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
    openGraph: {
      type: 'website',
      title,
      description,
      images: image ? [image] : [],
    },
  }
}
