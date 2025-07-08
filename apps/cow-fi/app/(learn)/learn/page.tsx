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
  // Pass raw categories data to client component for styling
  const categories =
    categoriesResponse?.map((category: any) => {
      const imageUrl = category?.attributes?.image?.data?.attributes?.url || ''

      return {
        name: category?.attributes?.name || '',
        slug: category?.attributes?.slug || '',
        description: category?.attributes?.description || '',
        bgColor: category?.attributes?.backgroundColor || '',
        textColor: category?.attributes?.textColor || '',
        link: `/learn/topic/${category?.attributes?.slug}`,
        imageUrl,
      }
    }) || []

  return <LearnPageComponent featuredArticles={featuredArticles} categories={categories} />
}
