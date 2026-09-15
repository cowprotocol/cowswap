import { notFound } from 'next/navigation'

import { Article, Category, getArticles, getCategories } from '../../../../../services/cms'

import { ArticlesPageComponents } from '@/components/ArticlesPageComponents'
import { ARTICLES_PER_PAGE } from '@/const/pagination'
import {
  buildArticlePageParams,
  getValidatedArticlePageData,
  getValidatedArticlePagination,
  parseArticlePageIndex,
} from '@/util/articlePagination'

export type ArticlesResponse = {
  data?: Article[]
  meta?: {
    pagination?: {
      total?: number
    }
  }
}

type Props = {
  params: Promise<{ pageIndex?: string[] }>
}

export async function generateStaticParams(): Promise<{ pageIndex: string[] }[]> {
  const articlesResponse = await getArticles({ page: 1, pageSize: ARTICLES_PER_PAGE })
  const pagination = getValidatedArticlePagination(articlesResponse.meta.pagination, 1, ARTICLES_PER_PAGE)

  return buildArticlePageParams(pagination.pageCount)
}

// Next.js requires revalidate to be a literal number for static analysis
// 12 hours (43200 seconds) - pagination pages change infrequently
export const revalidate = 43200

// TODO: Reduce function complexity by extracting logic
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async function Page({ params }: Props) {
  const page = parseArticlePageIndex((await params).pageIndex)
  if (page === null) return notFound()

  const firstPageResponse = await getArticles({ page: 1, pageSize: ARTICLES_PER_PAGE })
  const firstPagePagination = getValidatedArticlePagination(firstPageResponse.meta.pagination, 1, ARTICLES_PER_PAGE)
  const firstPageArticles = getValidatedArticlePageData<Article>(firstPageResponse.data, firstPagePagination)

  if (firstPagePagination.pageCount === 0 || page > firstPagePagination.pageCount) {
    return notFound()
  }

  // Reuse the preflight response for the canonical first page; fetch only known-valid later pages.
  const articlesResponse = page === 1 ? firstPageResponse : await getArticles({ page, pageSize: ARTICLES_PER_PAGE })
  const pagination = getValidatedArticlePagination(articlesResponse.meta.pagination, page, ARTICLES_PER_PAGE)
  const pageArticles =
    page === 1 ? firstPageArticles : getValidatedArticlePageData<Article>(articlesResponse.data, pagination)

  // Get minimal articles for search - limit to reduce ISR cache busting
  // Search functionality can work with a subset of recent articles
  const searchArticlesResponse = await getArticles({ pageSize: 100 }) // Limit for performance
  const allArticles = searchArticlesResponse.data

  const articles =
    // TODO: Reduce function complexity by extracting logic

    pageArticles.map((article: Article) => ({
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
    }))

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
      totalArticles={pagination.total}
      currentPage={page}
      allCategories={allCategories}
    />
  )
}
