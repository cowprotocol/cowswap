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

export default async function TopicPage({ params }: Props) {
  const slug = (await params).topicSlug

  const category = await getCategoryBySlug(slug)

  if (!category) {
    return notFound()
  }

  // Fetch articles for this specific topic
  const topicArticlesResponse = await getArticles({
    page: 0,
    pageSize: 50,
    filters: {
      categories: {
        slug: {
          $eq: slug,
        },
      },
    },
  })

  // Fetch all articles for search functionality
  const allArticlesResponse = await getArticles({
    fetchAll: true,
  })

  const topicArticles = topicArticlesResponse.data
  const allArticles = allArticlesResponse.data

  const categoriesResponse = await getCategories()
  const allCategories =
    categoriesResponse?.map((category: any) => ({
      name: category?.attributes?.name || '',
      slug: category?.attributes?.slug || '',
    })) || []

  return (
    <TopicPageComponent
      category={category}
      allCategories={allCategories}
      articles={topicArticles}
      allArticles={allArticles}
    />
  )
}
