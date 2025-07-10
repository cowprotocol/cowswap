'use client'

import { UI } from '@cowprotocol/ui'

import { TopicsPageComponent } from '@/components/TopicsPageComponent'
import { ARTICLES_LARGE_PAGE_SIZE } from '@/const/pagination'

import { getArticles, getCategories } from '../../../../services/cms'

export default async function TopicsPage() {
  const articlesResponse = await getArticles({ pageSize: ARTICLES_LARGE_PAGE_SIZE })
  const articles = articlesResponse.data

  const categoriesResponse = await getCategories()
  const categories =
    categoriesResponse?.map((category: any) => {
      const imageUrl = category?.attributes?.image?.data?.attributes?.url || ''

      return {
        name: category?.attributes?.name || '',
        slug: category?.attributes?.slug || '',
        description: category?.attributes?.description || '',
        bgColor: category?.attributes?.backgroundColor || `var(${UI.COLOR_NEUTRAL_100})`,
        textColor: category?.attributes?.textColor || `var(${UI.COLOR_NEUTRAL_0})`,
        link: `/learn/topic/${category?.attributes?.slug}`,
        iconColor: 'transparent',
        imageUrl,
      }
    }) || []

  return <TopicsPageComponent articles={articles} categories={categories} />
}
