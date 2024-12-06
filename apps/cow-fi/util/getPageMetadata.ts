import type { Metadata } from 'next'

export async function getPageMetadata({
  title,
  description,
}: {
  title: string
  description: string
}): Promise<Metadata> {
  return {
    title,
    description,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    openGraph: {
      type: 'website',
      title,
      description,
    },
  }
}
