import React from 'react'

import { GetStaticPaths, GetStaticProps } from 'next'
import { Category, getAllCategorySlugs, getCategoryBySlug } from 'services/cms'

import { CategoryContent } from '@/components/Category'

const DATA_CACHE_TIME_SECONDS = 10 * 60 // 10 minutes



export interface CategoryPageProps {
  category: Category
}

export default function CategoryPage({ category }: CategoryPageProps) {
  return <CategoryContent category={category} />
}

type CategoryQuery = { categorySlug: string}

export const getStaticPaths: GetStaticPaths<CategoryQuery> = async () => {
  const allSlugs = await getAllCategorySlugs()

  return {
    fallback: false,
    paths: allSlugs.map((categorySlug) => ({
      params: { categorySlug }
    })),
  }
}

export const getStaticProps: GetStaticProps<CategoryPageProps, CategoryQuery> = async ({ params }) => {
  const category = await getCategoryBySlug(params.categorySlug)

  if (!category) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      category,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
