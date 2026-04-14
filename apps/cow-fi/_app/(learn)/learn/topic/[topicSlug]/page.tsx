import type { ReactNode } from 'react'

import { notFound } from 'next/navigation'

import {
  Category,
  getAllCategorySlugs,
  getArticles,
  getCategories,
  getCategoryBySlug,
} from '../../../../../services/cms'

import type { Metadata } from 'next'

import { TopicPageComponent } from '@/components/TopicPageComponent'
import { getPageMetadata } from '@/util/getPageMetadata'

type Props = {
  params: Promise<{ topicSlug: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

// Next.js requires revalidate to be a literal number for static analysis
// 12 hours (43200 seconds) - balanced between freshness and cache efficiency
export const revalidate = 43200

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

export async function generateStaticParams(): Promise<{ topicSlug: string }[]> {
  'use server'

  const categoriesResponse = await getAllCategorySlugs()

  return categoriesResponse.map((topicSlug) => ({ topicSlug }))
}

export default async function TopicPage({ params }: { params: Promise<{ topicSlug: string }> }): Promise<ReactNode> {
  const { topicSlug } = await params
  const category = await getCategoryBySlug(topicSlug)

  if (!category) {
    notFound()
  }

  const formattedCategory = formatCategoryForTopicPage(category)
  const [topicArticlesResponse, allArticlesResponse, categoriesResponse] = await Promise.all([
    getArticles({
      filters: {
        categories: {
          slug: {
            $eq: topicSlug,
          },
        },
      },
    }),
    getArticles(),
    getCategories(),
  ])

  const topicArticles = topicArticlesResponse.data
  const allArticles = allArticlesResponse.data
  const allCategories = categoriesResponse?.map(formatCategoryForList) || []

  return (
    <TopicPageComponent
      category={formattedCategory}
      allCategories={allCategories}
      articles={topicArticles}
      allArticles={allArticles}
    />
  )
}

function formatCategoryForTopicPage(category: Category): {
  name: string
  slug: string
  description: string
  bgColor: string
  textColor: string
  imageUrl: string
} {
  const attrs = category.attributes
  if (!attrs) {
    return {
      name: '',
      slug: '',
      description: '',
      bgColor: '#FFFFFF',
      textColor: '#000000',
      imageUrl: '',
    }
  }

  return {
    name: attrs.name ?? '',
    slug: attrs.slug ?? '',
    description: attrs.description ?? '',
    bgColor: attrs.backgroundColor ?? '#FFFFFF',
    textColor: attrs.textColor ?? '#000000',
    imageUrl: attrs.image?.data?.attributes?.url ?? '',
  }
}

function formatCategoryForList(category: Category): {
  name: string
  slug: string
} {
  return {
    name: category.attributes?.name ?? '',
    slug: category.attributes?.slug ?? '',
  }
}
