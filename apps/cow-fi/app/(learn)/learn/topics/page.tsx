'use server'

import { getArticles, getCategories } from '../../../../services/cms'
import { TopicsPageComponent } from '@/components/TopicsPageComponent'

export default async function Page() {
  const categoriesResponse = await getCategories()
  const articlesResponse = await getArticles()

  const categories =
    categoriesResponse?.map((category: any) => {
      const imageUrl = category?.attributes?.image?.data?.attributes?.url || ''

      return {
        name: category?.attributes?.name || '',
        slug: category?.attributes?.slug || '',
        description: category?.attributes?.description || '',
        bgColor: category?.attributes?.backgroundColor || '#fff',
        textColor: category?.attributes?.textColor || '#000',
        link: `/learn/topic/${category?.attributes?.slug}`,
        iconColor: 'transparent',
        imageUrl,
      }
    }) || []

  return <TopicsPageComponent categories={categories} articles={articlesResponse.data} />
}
