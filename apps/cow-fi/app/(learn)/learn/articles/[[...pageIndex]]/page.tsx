import { redirect } from 'next/navigation'

import { ArticlesPageComponents } from '@/components/ArticlesPageComponents'
import { ARTICLES_PER_PAGE } from '@/const/pagination'

import { Article, Category, getArticles, getCategories } from '../../../../../services/cms'


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

// Static limit for reasonable page range to prevent dynamic ISR invalidation
const MAX_PAGE_LIMIT = 1000

// Generate static params for first 10 pages only to avoid dynamic content issues
// Additional pages will be generated on-demand with dynamicParams = true
export async function generateStaticParams(): Promise<{ pageIndex: string[] }[]> {
  // Static generation for first 10 pages - avoids dynamic CMS calls that bust ISR cache
  const MAX_STATIC_PAGES = 10
  return Array.from({ length: MAX_STATIC_PAGES }, (_, i) => ({
    pageIndex: [(i + 1).toString()],
  }))
}

// Enable dynamic params for pages beyond the static limit
export const dynamicParams = true

// Next.js requires revalidate to be a literal number for static analysis
// This value (3600 seconds = 1 hour) should match CMS_CACHE_TIME in services/cms/index.ts
export const revalidate = 3600

// TODO: Reduce function complexity by extracting logic
// TODO: Add proper return type annotation
// eslint-disable-next-line complexity, @typescript-eslint/explicit-function-return-type
export default async function Page({ params }: Props) {
  const pageParam = (await params)?.pageIndex?.[0]
  const paramsAreSet = Boolean(pageParam)
  const pageIndexIsValid = Boolean(pageParam && /^\d+$/.test(pageParam))

  // Redirect invalid page numbers to the main articles page
  if (paramsAreSet && !pageIndexIsValid) {
    return redirect('/learn/articles')
  }

  const page = pageParam && pageIndexIsValid ? parseInt(pageParam, 10) : 1

  // Fetch paginated articles for display
  const articlesResponse = await getArticles({ page, pageSize: ARTICLES_PER_PAGE })
  const totalArticles = articlesResponse.meta?.pagination?.total || 0

  // Static bounds checking to avoid dynamic ISR invalidation
  // Allow reasonable page range - let CMS handle actual bounds
  if (page < 1 || page > MAX_PAGE_LIMIT) {
    // Conservative upper limit
    return redirect('/learn/articles')
  }

  // If no articles returned, likely beyond actual bounds
  if (!articlesResponse.data || articlesResponse.data.length === 0) {
    return redirect('/learn/articles')
  }

  // Get minimal articles for search - limit to reduce ISR cache busting
  // Search functionality can work with a subset of recent articles
  const searchArticlesResponse = await getArticles({ pageSize: 100 }) // Limit for performance
  const allArticles = searchArticlesResponse.data

  const articles =
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
