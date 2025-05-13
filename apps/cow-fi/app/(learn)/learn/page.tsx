import { LearnPageComponent } from '@/components/LearnPageComponent'
import { ARTICLES_LARGE_PAGE_SIZE, FEATURED_ARTICLES_PAGE_SIZE } from '@/const/pagination'
import { getArticles, getCategories } from '../../../services/cms'

export default async function LearnPage() {
  const articlesResponse = await getArticles({ pageSize: ARTICLES_LARGE_PAGE_SIZE })
  const articles = articlesResponse.data

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
    const slug = attributes?.slug || 'no-slug'
    return {
      title: attributes?.title || 'No title',
      description: attributes?.description || 'No description',
      // IMPORTANT: Must use direct string interpolation for href in Next.js App Router
      // Object format ({ pathname: '/learn/[article]', query: { article: slug } })
      // is not supported and will cause "Dynamic href" errors
      link: `/learn/${slug}`,
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

  return <LearnPageComponent articles={articles} featuredArticles={featuredArticles} categories={categories} />
}
