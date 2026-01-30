import type { ReactNode } from 'react'

import { Category, getArticles, getCategories } from '../../../services/cms'

import { LearnPageComponent } from '@/components/LearnPageComponent'
import { FEATURED_ARTICLES_PAGE_SIZE } from '@/const/pagination'

// Next.js requires revalidate to be a literal number for static analysis
// 12 hours (43200 seconds) - balanced between freshness and cache efficiency
export const revalidate = 43200

export default async function LearnPage(): Promise<ReactNode> {
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
  const categories = categoriesResponse?.map(formatCategoryForComponent) || []

  return <LearnPageComponent featuredArticles={featuredArticles} categories={categories} />
}

function formatCategoryForComponent(category: Category): {
  name: string
  slug: string
  description: string
  bgColor: string
  textColor: string
  link: string
  imageUrl: string
} {
  const attrs = category?.attributes
  if (!attrs) {
    return {
      name: '',
      slug: '',
      description: '',
      bgColor: '',
      textColor: '',
      link: '/learn/topic/',
      imageUrl: '',
    }
  }

  return {
    name: attrs.name ?? '',
    slug: attrs.slug ?? '',
    description: attrs.description ?? '',
    bgColor: attrs.backgroundColor ?? '',
    textColor: attrs.textColor ?? '',
    link: `/learn/topic/${attrs.slug ?? ''}`,
    imageUrl: attrs.image?.data?.attributes?.url ?? '',
  }
}
