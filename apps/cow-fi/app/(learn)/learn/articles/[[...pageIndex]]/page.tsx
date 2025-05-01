import { ArticlesPageComponents } from '@/components/ArticlesPageComponents'
import { redirect } from 'next/navigation'
import { Article, getArticles, getCategories } from '../../../../../services/cms'
import { ARTICLES_PER_PAGE } from '@/const/pagination'
import { calculateTotalPages } from '@/util/paginationUtils'

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

export async function generateStaticParams() {
  const articlesResponse = await getArticles({ page: 0, pageSize: ARTICLES_PER_PAGE })
  const totalArticles = articlesResponse.meta?.pagination?.total || 0
  const totalPages = calculateTotalPages(totalArticles)

  return Array.from({ length: totalPages }, (_, i) => ({ pageIndex: [(i + 1).toString()] }))
}

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

  // If page number is out of bounds (either less than 1 or greater than total pages), redirect to page 1
  const numberOfPages = calculateTotalPages(totalArticles)
  if (page < 1 || page > numberOfPages) {
    return redirect('/learn/articles')
  }

  // Get all articles for search functionality
  const allArticlesResponse = await getArticles()
  const allArticles = allArticlesResponse.data

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
    categoriesResponse?.map((category: any) => ({
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
