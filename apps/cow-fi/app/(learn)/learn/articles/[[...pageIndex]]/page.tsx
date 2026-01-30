import { notFound } from 'next/navigation'

import { Article, Category, getArticles, getCategories } from '../../../../../services/cms'

import { ArticlesPageComponents } from '@/components/ArticlesPageComponents'
import { ARTICLES_PER_PAGE } from '@/const/pagination'

type Props = {
  params: Promise<{ pageIndex?: string[] }>
}

export type ArticlesResponse = {
  data?: Article[]
  meta?: {
    pagination?: {
      total?: number
    }
  }
}

// Generate static params with conservative estimate
// Based on realistic content volume - prevents phantom page generation while covering real content
export async function generateStaticParams(): Promise<{ pageIndex: string[] }[]> {
  // Conservative estimate: 15 pages covers ~360 articles
  // This is generous for most sites while preventing the 1000+ phantom pages issue
  // If you grow beyond this, just increase the number and redeploy
  const REASONABLE_PAGE_LIMIT = 15

  const pages = Array.from({ length: REASONABLE_PAGE_LIMIT }, (_, i) => ({
    pageIndex: [(i + 1).toString()],
  }))

  // Add base route: /learn/articles (no pageIndex = page 1)
  pages.unshift({ pageIndex: [] })

  return pages
}

// Disable dynamic params to prevent phantom page generation from crawlers/bots
// Only pre-rendered pages 1-15 will be accessible - pages 16+ get proper 404s
// For production: false blocks phantom pages | For local dev: true allows on-demand generation
export const dynamicParams = false

// Next.js requires revalidate to be a literal number for static analysis
// 12 hours (43200 seconds) - pagination pages change infrequently
export const revalidate = 43200

// TODO: Reduce function complexity by extracting logic
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async function Page({ params }: Props) {
  // With dynamicParams = false, only pre-rendered pages are accessible
  // Next.js handles 404s for non-existent pages automatically
  const pageParam = (await params)?.pageIndex?.[0]
  const page = pageParam ? parseInt(pageParam, 10) : 1

  // Fetch paginated articles for display
  const articlesResponse = await getArticles({ page, pageSize: ARTICLES_PER_PAGE })
  const totalArticles = articlesResponse.meta?.pagination?.total || 0

  // Defensive check - if CMS returns no data for a pre-rendered page, something's wrong
  if (!articlesResponse.data || articlesResponse.data.length === 0) {
    return notFound()
  }

  // Get minimal articles for search - limit to reduce ISR cache busting
  // Search functionality can work with a subset of recent articles
  const searchArticlesResponse = await getArticles({ pageSize: 100 }) // Limit for performance
  const allArticles = searchArticlesResponse.data

  const articles =
    // TODO: Reduce function complexity by extracting logic
    // eslint-disable-next-line complexity
    articlesResponse.data?.map((article: Article) => ({
      ...article,
      id: article.id || 0,
      attributes: {
        ...article.attributes,
        title: article.attributes?.title ?? 'Untitled',
        description: article.attributes?.description ?? '',
        slug: article.attributes?.slug ?? 'no-slug',
        featured: article.attributes?.featured ?? false,
        publishDateVisible: article.attributes?.publishDateVisible ?? false,
        cover: article.attributes?.cover ?? {},
        blocks: article.attributes?.blocks ?? [],
      },
    })) || []

  const categoriesResponse = await getCategories()
  const allCategories =
    categoriesResponse?.map((category: Category) => ({
      name: category?.attributes?.name || '',
      slug: category?.attributes?.slug || '',
    })) || []

  return (
    <ArticlesPageComponents
      articles={articles}
      allArticles={allArticles}
      totalArticles={totalArticles}
      currentPage={page}
      allCategories={allCategories}
    />
  )
}
