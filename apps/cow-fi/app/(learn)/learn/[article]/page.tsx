import { ArticlePageComponent } from '@/components/ArticlePageComponent'
import { FEATURED_ARTICLES_PAGE_SIZE } from '@/const/pagination'
import { getPageMetadata } from '@/util/getPageMetadata'
import { stripHtmlTags } from '@/util/stripHTMLTags'
import { fetchArticleWithRetry } from '@/util/fetchHelpers'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  Article,
  getAllArticleSlugs,
  getArticleBySlug,
  getArticles,
  getCategories,
  SharedRichTextComponent,
} from '../../../../services/cms'

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
        : plainContent.length > 150
          ? stripHtmlTags(plainContent.substring(0, 147)) + '...'
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

    // Get related articles
    const articlesResponse = await getArticles()
    const articles = articlesResponse.data

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

    const randomArticles = getRandomArticles(articles, 3)
    const categoriesResponse = await getCategories()
    const allCategories =
      categoriesResponse?.map((category: any) => ({
        name: category?.attributes?.name || '',
        slug: category?.attributes?.slug || '',
      })) || []

    return (
      <ArticlePageComponent
        article={article}
        articles={articles}
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
