import type { ReactNode } from 'react'

import { notFound } from 'next/navigation'

import { getPageBySlug } from '../../../../services/cms'

import type { Metadata } from 'next'

import { ReferToEarnPageContent } from '@/components/ReferToEarnPageContent'
import { extractRichTextContent } from '@/util/cms'
import { getPageMetadata } from '@/util/getPageMetadata'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('refer-to-earn')
  if (!page?.attributes?.heading) return notFound()

  return getPageMetadata({
    title: `${page.attributes.heading} - CoW DAO`,
    description: page.attributes.description || page.attributes.heading,
  })
}

export default async function Page(): Promise<ReactNode> {
  const page = await getPageBySlug('refer-to-earn')
  if (!page?.attributes?.heading || !page.attributes.contentSections?.length) return notFound()

  const content = extractRichTextContent(page)
  if (!content.trim()) return notFound()

  return <ReferToEarnPageContent title={page.attributes.heading} content={content} />
}

export const revalidate = 43200
