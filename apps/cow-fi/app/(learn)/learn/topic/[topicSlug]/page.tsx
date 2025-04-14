import { TopicPageComponent } from '@/components/TopicPageComponent'
import { getPageMetadata } from '@/util/getPageMetadata'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllCategorySlugs, getArticles, getCategories, getCategoryBySlug } from '../../../../../services/cms'

type Props = {
  params: Promise<{ topicSlug: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  'use server'

  const { topicSlug } = await params

  if (!topicSlug) return {}

  const category = await getCategoryBySlug(topicSlug)
  const { name, description = '' } = category?.attributes || {}

  return getPageMetadata({
    absoluteTitle: `${name} - Knowledge base`,
    description,
  })
}

export async function generateStaticParams() {
  'use server'

  const categoriesResponse = await getAllCategorySlugs()

  return categoriesResponse.map((topicSlug) => ({ topicSlug }))
}

export default async function TopicPage({ params }: { params: Promise<{ topicSlug: string }> }) {
  // Get the category
  const { topicSlug } = await params
  const category = await getCategoryBySlug(topicSlug)

  if (!category) {
    notFound()
  }

  // Format the category for the component
  const formattedCategory = {
    name: category.attributes?.name || '',
    slug: category.attributes?.slug || '',
    description: category.attributes?.description || '',
    bgColor: category.attributes?.backgroundColor || '#FFFFFF',
    textColor: category.attributes?.textColor || '#000000',
    imageUrl: category.attributes?.image?.data?.attributes?.url || '',
  }

  // Get articles for this topic
  const topicArticlesResponse = await getArticles({
    filters: {
      categories: {
        slug: {
          $eq: topicSlug,
        },
      },
    },
  })

  // Get articles for search functionality
  const allArticlesResponse = await getArticles()

  const topicArticles = topicArticlesResponse.data
  const allArticles = allArticlesResponse.data

  const categoriesResponse = await getCategories()
  const allCategories =
    categoriesResponse?.map((category: any) => {
      return {
        name: category.attributes?.name || '',
        slug: category.attributes?.slug || '',
      }
    }) || []

  return (
    <TopicPageComponent
      category={formattedCategory}
      allCategories={allCategories}
      articles={topicArticles}
      allArticles={allArticles}
    />
  )
}
