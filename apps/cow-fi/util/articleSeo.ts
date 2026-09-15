import { isRecord } from '@cowprotocol/common-utils/json-utils'

import type { Article, SharedRichTextComponent } from '../services/cms'

import { CONFIG } from '@/const/meta'
import { stripHtmlTags } from '@/util/stripHTMLTags'

const ARTICLE_DESCRIPTION_MAX_LENGTH = 150
const ARTICLE_DESCRIPTION_TRUNCATE_LENGTH = ARTICLE_DESCRIPTION_MAX_LENGTH - 3
const DEFAULT_ARTICLE_TITLE = 'CoW DAO Article'
const PUBLISHER_LOGO_URL = new URL('/favicon-light-mode.png', CONFIG.url.root).toString()
const PUBLISHER_NAME = 'CoW DAO'

export interface ArticleSeoData {
  authorNames: string[]
  canonicalUrl: string
  categoryNames: string[]
  description: string
  imageUrl?: string
  modifiedTime?: string
  publishedTime?: string
  title: string
}

export interface ArticleStructuredData {
  '@context': 'https://schema.org'
  '@graph': Record<string, unknown>[]
}

export function buildArticleStructuredData(article: Article, slug: string): ArticleStructuredData {
  const seo = getArticleSeoData(article, slug)
  const articleNode: Record<string, unknown> = {
    '@type': 'BlogPosting',
    '@id': `${seo.canonicalUrl}#article`,
    headline: seo.title,
    description: seo.description,
    url: seo.canonicalUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': seo.canonicalUrl,
    },
    author: seo.authorNames.map((name) => ({
      '@type': name === PUBLISHER_NAME ? 'Organization' : 'Person',
      name,
    })),
    publisher: {
      '@type': 'Organization',
      name: PUBLISHER_NAME,
      url: CONFIG.url.root,
      logo: {
        '@type': 'ImageObject',
        url: PUBLISHER_LOGO_URL,
      },
    },
  }

  if (seo.imageUrl) articleNode.image = [seo.imageUrl]
  if (seo.publishedTime) articleNode.datePublished = seo.publishedTime
  if (seo.modifiedTime) articleNode.dateModified = seo.modifiedTime
  if (seo.categoryNames.length > 0) articleNode.articleSection = seo.categoryNames

  return {
    '@context': 'https://schema.org',
    '@graph': [
      articleNode,
      {
        '@type': 'BreadcrumbList',
        '@id': `${seo.canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: CONFIG.url.root,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Knowledge Base',
            item: new URL('/learn', CONFIG.url.root).toString(),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: seo.title,
            item: seo.canonicalUrl,
          },
        ],
      },
    ],
  }
}

export function getArticleSeoData(article: Article, slug: string): ArticleSeoData {
  const canonicalUrl = new URL(`/learn/${slug}`, CONFIG.url.root).toString()
  const attributes = article.attributes

  if (!attributes) {
    return {
      authorNames: [PUBLISHER_NAME],
      canonicalUrl,
      categoryNames: [],
      description: '',
      title: DEFAULT_ARTICLE_TITLE,
    }
  }

  const plainContent = stripHtmlTags(getArticleContent(attributes.blocks))
  const plainDescription = stripHtmlTags(attributes.description || plainContent)
  const authorNames = getRelationNames(attributes.authorsBio)

  return {
    title: attributes.title || DEFAULT_ARTICLE_TITLE,
    description: truncateDescription(plainDescription),
    canonicalUrl,
    imageUrl: toAbsoluteUrl(attributes.cover?.data?.attributes?.url),
    publishedTime: firstValidDate(attributes.publishDate, attributes.publishedAt),
    modifiedTime: firstValidDate(attributes.updatedAt),
    authorNames: authorNames.length > 0 ? authorNames : [PUBLISHER_NAME],
    categoryNames: getRelationNames(attributes.categories),
  }
}

export function getRelationNames(relation: unknown): string[] {
  if (!isRecord(relation)) return []

  const data = relation.data
  const entities = Array.isArray(data) ? data : [data]

  return entities.flatMap((entity) => {
    if (!isRecord(entity) || !isRecord(entity.attributes)) return []

    const name = entity.attributes.name
    return typeof name === 'string' && name.trim() ? [name.trim()] : []
  })
}

export function serializeJsonLd(value: unknown): string {
  // Escape `<` so CMS-controlled values cannot close the JSON-LD script with `</script>` and inject markup.
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

function firstValidDate(...values: (string | undefined)[]): string | undefined {
  for (const value of values) {
    if (!value) continue

    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date.toISOString()
  }

  return undefined
}

function getArticleContent(blocks: NonNullable<Article['attributes']>['blocks']): string {
  return blocks?.map((block: unknown) => (isRichTextComponent(block) ? block.body : '')).join(' ') || ''
}

function isRichTextComponent(block: unknown): block is SharedRichTextComponent {
  return isRecord(block) && typeof block.body === 'string'
}

function toAbsoluteUrl(value?: string): string | undefined {
  if (!value) return undefined

  try {
    return new URL(value, CONFIG.url.root).toString()
  } catch {
    return undefined
  }
}

function truncateDescription(description: string): string {
  return description.length > ARTICLE_DESCRIPTION_MAX_LENGTH
    ? `${description.substring(0, ARTICLE_DESCRIPTION_TRUNCATE_LENGTH)}...`
    : description
}
