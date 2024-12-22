'use server'

import { Article, getArticles, getCategories } from '../../../../../services/cms'
import { ArticlesPageComponents } from '@/components/ArticlesPageComponents'
import { redirect } from 'next/navigation'

const ITEMS_PER_PAGE = 24

type Props = {
  params: Promise<{ pageIndex?: string }>
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
  const articlesResponse = await getArticles({ page: 0, pageSize: ITEMS_PER_PAGE })
  const totalArticles = articlesResponse.meta?.pagination?.total || 0
  const totalPages = Math.ceil(totalArticles / ITEMS_PER_PAGE)

  return Array.from({ length: totalPages }, (_, i) => ({ pageIndex: [(i + 1).toString()] }))
}

export default async function Page({ params }: Props) {
  const pageParam = (await params)?.pageIndex
  const paramsAreSet = Boolean(pageParam && pageParam.length > 0)
  const pageIndexIsValid = Boolean(pageParam && /^\d+$/.test(pageParam))

  if (paramsAreSet && !pageIndexIsValid) {
    return redirect('/learn/articles')
  }

  const page = pageParam && pageIndexIsValid ? parseInt(pageParam, 10) : 1

  const articlesResponse = (await getArticles({ page, pageSize: ITEMS_PER_PAGE })) as ArticlesResponse

  const totalArticles = articlesResponse.meta?.pagination?.total || 0
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
      totalArticles={totalArticles}
      currentPage={page}
      allCategories={allCategories}
    />
  )
}
