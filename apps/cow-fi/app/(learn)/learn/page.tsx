import { LearnPageComponent } from '@/components/LearnPageComponent'
import { FEATURED_ARTICLES_PAGE_SIZE } from '@/const/pagination'

import { getArticles, getCategories } from '../../../services/cms'

export const revalidate = 3600 // Revalidate at most once per hour

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
        bgColor: category?.attributes?.backgroundColor || '#FFFFFF',
        textColor: category?.attributes?.textColor || '#000000',
        link: `/learn/topic/${category?.attributes?.slug}`,
        iconColor: '#FFFFFF',
        imageUrl,
      }
    }) || []

  return <LearnPageComponent featuredArticles={featuredArticles} categories={categories} />
}
