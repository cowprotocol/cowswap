import type { ReactNode } from 'react'

import { UI } from '@cowprotocol/ui'

import { Category, getArticles, getCategories } from '../../../../services/cms'

import { TopicsPageComponent } from '@/components/TopicsPageComponent'
import { ARTICLES_LARGE_PAGE_SIZE } from '@/const/pagination'

// Next.js requires revalidate to be a literal number for static analysis
// 12 hours (43200 seconds) - balanced between freshness and cache efficiency
export const revalidate = 43200

export default async function TopicsPage(): Promise<ReactNode> {
  const articlesResponse = await getArticles({ pageSize: ARTICLES_LARGE_PAGE_SIZE })
  const articles = articlesResponse.data

  const categoriesResponse = await getCategories()
  const categories = categoriesResponse?.map(formatCategoryForTopicsPage) || []

  return <TopicsPageComponent articles={articles} categories={categories} />
}

function formatCategoryForTopicsPage(category: Category): {
  name: string
  slug: string
  description: string
  bgColor: string
  textColor: string
  link: string
  iconColor: string
  imageUrl: string
} {
  const attrs = category?.attributes
  if (!attrs) {
    return {
      name: '',
      slug: '',
      description: '',
      bgColor: `var(${UI.COLOR_NEUTRAL_100})`,
      textColor: `var(${UI.COLOR_NEUTRAL_0})`,
      link: '/learn/topic/',
      iconColor: 'transparent',
      imageUrl: '',
    }
  }

  return {
    name: attrs.name ?? '',
    slug: attrs.slug ?? '',
    description: attrs.description ?? '',
    bgColor: attrs.backgroundColor ?? `var(${UI.COLOR_NEUTRAL_100})`,
    textColor: attrs.textColor ?? `var(${UI.COLOR_NEUTRAL_0})`,
    link: `/learn/topic/${attrs.slug ?? ''}`,
    iconColor: 'transparent',
    imageUrl: attrs.image?.data?.attributes?.url ?? '',
  }
}
