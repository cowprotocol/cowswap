'use server'

import React from 'react'
import { getAllCategorySlugs, getArticles, getCategories, getCategoryBySlug } from '../../../../../services/cms'
import { TopicPageComponent } from '@/components/TopicPageComponent'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPageMetadata } from '@/util/getPageMetadata'

type Props = {
  params: Promise<{ topicSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const topicSlug = (await params).topicSlug

  if (!topicSlug) return {}

  const category = await getCategoryBySlug(topicSlug)
  const { name, description = '' } = category?.attributes || {}

  return getPageMetadata({
    absoluteTitle: `${name} - Knowledge base`,
    description,
  })
}

export async function generateStaticParams() {
  const categoriesResponse = await getAllCategorySlugs()

  return categoriesResponse.map((topicSlug) => ({ topicSlug }))
}

export default async function TopicPage({ params }: { params: { topicSlug: string } }) {
  // Get the category
  const category = await getCategoryBySlug(params.topicSlug)

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
          $eq: params.topicSlug,
        },
      },
    },
    pageSize: 100,
  })

  // Get articles for search functionality (limited to 100 instead of fetchAll)
  const allArticlesResponse = await getArticles({
    pageSize: 100,
  })

  const topicArticles = topicArticlesResponse.data
  const allArticles = allArticlesResponse.data

  const categoriesResponse = await getCategories()
  // Format categories for the component
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
