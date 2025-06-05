'use client'

import { UI } from '@cowprotocol/ui'

import { LearnPageComponent } from '@/components/LearnPageComponent'
import { FEATURED_ARTICLES_PAGE_SIZE } from '@/const/pagination'

import { getArticles, getCategories } from '../../../services/cms'

export default async function LearnPage() {
  // Fetch featured articles
  const featuredArticlesResponse = await getArticles({
    filters: {
      featured: {
        $eq: true,
      },
    },
    pageSize: FEATURED_ARTICLES_PAGE_SIZE,
  })

  // Format featured articles for the component
  const featuredArticles = featuredArticlesResponse.data.map((article) => {
    const attributes = article.attributes
    return {
      title: attributes?.title || 'No title',
      description: attributes?.description || 'No description',
      link: `/learn/${attributes?.slug || 'no-slug'}`,
      cover: attributes?.cover?.data?.attributes?.url || '',
    }
  })

  const categoriesResponse = await getCategories()
  // Format categories for the component
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
        iconColor: `var(${UI.COLOR_NEUTRAL_100})`,
        imageUrl,
      }
    }) || []

  return <LearnPageComponent featuredArticles={featuredArticles} categories={categories} />
}
