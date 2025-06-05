import { notFound } from 'next/navigation'

import { ArticlePageComponent } from '@/components/ArticlePageComponent'
import { FEATURED_ARTICLES_PAGE_SIZE } from '@/const/pagination'
import { fetchArticleWithRetry } from '@/util/fetchHelpers'
import { getPageMetadata } from '@/util/getPageMetadata'
import { stripHtmlTags } from '@/util/stripHTMLTags'

import {
  Article,
  getAllArticleSlugs,
  getArticleBySlug,
  getArticles,
  getCategories,
  SharedRichTextComponent,
} from '../../../../services/cms'

import type { Metadata } from 'next'

export const revalidate = 3600 // Revalidate at most once per hour

// Maximum length for metadata descriptions. When content exceeds MAX_LENGTH,
// we truncate to TRUNCATE_LENGTH (MAX_LENGTH - 3) to make room for "..." ellipsis
const METADATA_DESCRIPTION_MAX_LENGTH = 150
const METADATA_DESCRIPTION_TRUNCATE_LENGTH = METADATA_DESCRIPTION_MAX_LENGTH - 3

function isRichTextComponent(block: any): block is SharedRichTextComponent {
  return block.body !== undefined
}

type Props = {
  params: Promise<{ article: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const articleSlug = (await params).article

  if (!articleSlug) return {}

  try {
    const article = await getArticleBySlug(articleSlug)
    if (!article || !article.attributes) {
      return getPageMetadata({
        title: 'Article Not Found',
        description: 'The requested article could not be found.',
      })
    }

    const attributes = article.attributes
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
    console.error(`Error generating metadata for article ${articleSlug}:`, error)
    return getPageMetadata({
      title: 'Article',
      description: 'Loading article...',
    })
  }
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllArticleSlugs()
    return slugs.map((article) => ({ article }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default async function ArticlePage({ params }: Props) {
  const articleSlug = (await params).article

  try {
    const article = await fetchArticleWithRetry(articleSlug)

    if (!article) {
      return notFound()
    }

    // Fetch featured articles
    const featuredArticlesResponse = await getArticles({
      filters: {
        featured: {
          $eq: true,
        },
      },
      pageSize: FEATURED_ARTICLES_PAGE_SIZE,
    })
    const featuredArticles = featuredArticlesResponse.data

    // Get articles for random selection
    const allArticlesResponse = await getArticles()
    const randomArticles = getRandomArticles(allArticlesResponse.data, 3)
    const categoriesResponse = await getCategories()
    const allCategories =
      categoriesResponse?.map((category: any) => ({
        name: category?.attributes?.name || '',
        slug: category?.attributes?.slug || '',
      })) || []

    return (
      <ArticlePageComponent
        article={article}
        randomArticles={randomArticles}
        featuredArticles={featuredArticles}
        allCategories={allCategories}
      />
    )
  } catch (error) {
    console.error(`Error fetching article ${articleSlug}:`, error)
    return notFound()
  }
}

function getRandomArticles(articles: Article[], count: number): Article[] {
  const shuffled = articles.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}
