'use server'

import { getArticles, getCategories } from '../../../services/cms'
import { Color } from '@cowprotocol/ui'

import { LearnPageComponent } from '@/components/LearnPageComponent'

export default async function Page() {
  const categoriesResponse = await getCategories()
  const articlesResponse = await getArticles()

  const featuredArticlesResponse = await getArticles({
    filters: { featured: { $eq: true } },
    pageSize: 6,
  })

  const categories =
    categoriesResponse?.map((category: any) => {
      const imageUrl = category?.attributes?.image?.data?.attributes?.url || ''

      return {
        name: category?.attributes?.name || '',
        slug: category?.attributes?.slug || '',
        description: category?.attributes?.description || '',
        bgColor: category?.attributes?.backgroundColor || Color.neutral100,
        textColor: category?.attributes?.textColor || Color.neutral0,
        link: `/learn/topic/${category?.attributes?.slug}`,
        iconColor: Color.neutral100,
        imageUrl,
      }
    }) || []

  const featuredArticles = featuredArticlesResponse.data.map((article) => {
    const attributes = article.attributes
    return {
      title: attributes?.title || 'No title',
      description: attributes?.description || 'No description',
      link: `/learn/${attributes?.slug || 'no-slug'}`,
      cover: attributes?.cover?.data?.attributes?.url || '',
    }
  })

  return (
    <LearnPageComponent categories={categories} articles={articlesResponse.data} featuredArticles={featuredArticles} />
  )
}
