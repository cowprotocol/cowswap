import type { ReactNode } from 'react'

import { notFound, permanentRedirect } from 'next/navigation'

import { getAllResourceSlugs, getResourceBySlug, SharedRichTextComponent } from '../../../../../services/cms'

import type { Metadata } from 'next'

import { ResourcePageComponent } from '@/components/ResourcePageComponent'
import { getPageMetadata } from '@/util/getPageMetadata'
import { stripHtmlTags } from '@/util/stripHTMLTags'

export const revalidate = 43200

const METADATA_DESCRIPTION_MAX_LENGTH = 150
const METADATA_DESCRIPTION_TRUNCATE_LENGTH = METADATA_DESCRIPTION_MAX_LENGTH - 3

type Props = {
  params: Promise<{ campaign: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  if (!slug) return {}

  try {
    const resource = await getResourceBySlug(slug)
    if (!resource?.attributes) {
      return getPageMetadata({
        title: 'Resource Not Found',
        description: 'The requested resource could not be found.',
      })
    }

    const attributes = resource.attributes
    const { title, blocks, description, cover } = attributes
    const coverImageUrl = cover?.data?.attributes?.url
    const content =
      blocks?.map((block: SharedRichTextComponent) => (isRichTextComponent(block) ? block.body : '')).join(' ') || ''
    const plainContent = stripHtmlTags(content)

    return getPageMetadata({
      absoluteTitle: `${title} - CoW DAO`,
      description: description
        ? stripHtmlTags(description)
        : plainContent.length > METADATA_DESCRIPTION_MAX_LENGTH
          ? stripHtmlTags(plainContent.substring(0, METADATA_DESCRIPTION_TRUNCATE_LENGTH)) + '...'
          : stripHtmlTags(plainContent),
      image: coverImageUrl,
    })
  } catch (error) {
    console.error(`Error generating metadata for resource ${slug}:`, error)
    return getPageMetadata({
      title: 'Resource',
      description: 'Loading resource...',
    })
  }
}

export async function generateStaticParams(): Promise<{ campaign: string; slug: string }[]> {
  try {
    return await getAllResourceSlugs()
  } catch (error) {
    console.error('Error generating resource static params:', error)
    return []
  }
}

export default async function ResourcePage({ params }: Props): Promise<ReactNode> {
  const { campaign, slug } = await params

  let resource
  try {
    resource = await getResourceBySlug(slug)
  } catch (error) {
    console.error(`Error fetching resource ${slug}:`, error)
    return notFound()
  }

  if (!resource?.attributes) {
    return notFound()
  }

  // Keep outside try/catch — permanentRedirect throws a control-flow error Next must handle
  if (resource.attributes.campaign !== campaign) {
    permanentRedirect(`/resources/${resource.attributes.campaign}/${slug}`)
  }

  return <ResourcePageComponent resource={resource} />
}

function isRichTextComponent(block: unknown): block is SharedRichTextComponent {
  return (
    typeof block === 'object' &&
    block !== null &&
    'body' in block &&
    typeof (block as { body?: unknown }).body === 'string'
  )
}
