'use server'

import { getArticles, getCategories } from '../../../../services/cms'
import { Color } from '@cowprotocol/ui'
import { TopicsPageComponent } from '@/components/TopicsPageComponent'

export default async function Page() {
  const categoriesResponse = await getCategories()
  const articlesResponse = await getArticles({ pageSize: 200, fetchAll: true })

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
        iconColor: 'transparent',
        imageUrl,
      }
    }) || []

  return <TopicsPageComponent categories={categories} articles={articlesResponse.data} />
}
