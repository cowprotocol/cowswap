import React from 'react'

import Layout from '@/components/Layout'
import Head from 'next/head'

import { Section, SectionContent, SubTitle } from '@/components/Home/index.styles'

import { Color } from '@/styles/variables'
import { Category, getAllCategorySlugs, getCategories, getCategoryBySlug } from 'services/cms'

import { GetStaticPaths, GetStaticProps } from 'next'

import { CategoryContent, CategoryList } from '@/components/Category'
import { CONFIG } from '@/const/meta'
import SocialList from '@/components/SocialList'
import Link from 'next/link'
import { GetInTouchSection } from '@/components/Article'

const DATA_CACHE_TIME_SECONDS = 10 * 60 // 10 minutes

export interface CategoryPageProps {
  category: Category
  categories: Category[]
}

export default function CategoryPage({ category, categories }: CategoryPageProps) {
  const { id } = category
  const { name, slug, description, image } = category?.attributes || {}
  const shareImageUrl = image?.data?.attributes?.url

  return (
    <Layout fullWidthGradientVariant={true} data-article-id={id} data-slug={slug}>
      <Head>
        <title>
          {name} - {CONFIG.title}
        </title>
        <title>{name} CoW</title>

        <meta name="description" content={description} key="description" />
        <meta property="og:description" content={description} key="og-description" />
        <meta property="og:title" content={name} key="og-title" />
        <meta name="twitter:title" content={name} key="twitter-title" />
        {shareImageUrl && (
          <>
            <meta key="ogImage" property="og:image" content={shareImageUrl} />
            <meta key="twitterImage" name="twitter:image" content={shareImageUrl} />
          </>
        )}
      </Head>

      <CategoryContent category={category} />

      <Section fullWidth colorVariant={'dark-gradient'} padding="8rem 8rem 14rem 8rem">
        <SectionContent flow="column">
          <div className="container">
            <h3>Other Categories</h3>
            <SubTitle color={Color.text1} lineHeight={1.4} maxWidth={70}>
              Keep exploring the vibrant ecosystem.
            </SubTitle>

            <CategoryList categories={categories} />

            <Link href="/learn">Go back</Link>
          </div>
        </SectionContent>
      </Section>

      <GetInTouchSection />
    </Layout>
  )
}

type CategoryQuery = { categorySlug: string }

export const getStaticPaths: GetStaticPaths<CategoryQuery> = async () => {
  const allSlugs = await getAllCategorySlugs()

  return {
    fallback: false,
    paths: allSlugs.map((categorySlug) => ({
      params: { categorySlug },
    })),
  }
}

export const getStaticProps: GetStaticProps<CategoryPageProps, CategoryQuery> = async ({ params }) => {
  const category = params ? await getCategoryBySlug(params.categorySlug) : null
  const categories = await getCategories()

  if (!category) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      category,
      categories,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
