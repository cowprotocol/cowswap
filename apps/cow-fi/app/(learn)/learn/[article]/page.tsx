import type { ReactNode } from 'react'

import { notFound } from 'next/navigation'

import { Category, getAllArticleSlugs, getArticleBySlug, getArticles, getCategories } from '../../../../services/cms'

import type { Metadata } from 'next'

import { ArticlePageComponent } from '@/components/ArticlePageComponent'
import { FEATURED_ARTICLES_PAGE_SIZE } from '@/const/pagination'
import { buildArticleStructuredData, getArticleSeoData, serializeJsonLd } from '@/util/articleSeo'
import { isValidCmsSlug } from '@/util/cmsValidation'
import { fetchArticleWithRetry } from '@/util/fetchHelpers'
import { getPageMetadata } from '@/util/getPageMetadata'

// Next.js requires revalidate to be a literal number for static analysis
// 12 hours (43200 seconds) - balanced between freshness and cache efficiency
export const revalidate = 43200

type Props = {
  params: Promise<{ article: string }>
}

export default async function ArticlePage({ params }: Props): Promise<ReactNode> {
  const articleSlug = (await params).article

  if (!isValidCmsSlug(articleSlug)) {
    return notFound()
  }

  const article = await fetchArticleWithRetry(articleSlug)

  if (!article) {
    return notFound()
  }

  // Fetch featured articles
  const featuredArticlesResponse = await getArticles({
    filters: {
      featured: {
        $eq: true,
      },
    },
    pageSize: FEATURED_ARTICLES_PAGE_SIZE,
  })
  const featuredArticles = featuredArticlesResponse.data

  // Use first 3 featured articles for "Read more" section to ensure deterministic ISR caching
  const readMoreArticles = featuredArticles.slice(0, 3)
  const categoriesResponse = await getCategories()
  const allCategories =
    categoriesResponse?.map((category: Category) => ({
      name: category?.attributes?.name || '',
      slug: category?.attributes?.slug || '',
    })) || []

  return (
    <>
      <script
        id="article-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildArticleStructuredData(article, articleSlug)) }}
      />
      <ArticlePageComponent
        article={article}
        randomArticles={readMoreArticles}
        featuredArticles={featuredArticles}
        allCategories={allCategories}
      />
    </>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const articleSlug = (await params).article

  if (!articleSlug || !isValidCmsSlug(articleSlug)) {
    return getMissingArticleMetadata()
  }

  const article = await getArticleBySlug(articleSlug)
  if (!article || !article.attributes) {
    return getMissingArticleMetadata()
  }

  const seo = getArticleSeoData(article, articleSlug)
  const pageMetadata = getPageMetadata({
    absoluteTitle: `${seo.title} - CoW DAO`,
    description: seo.description,
    image: seo.imageUrl,
  })

  return {
    ...pageMetadata,
    alternates: { canonical: seo.canonicalUrl },
    authors: seo.authorNames.map((name) => ({ name })),
    publisher: 'CoW DAO',
    openGraph: {
      ...pageMetadata.openGraph,
      type: 'article',
      url: seo.canonicalUrl,
      publishedTime: seo.publishedTime,
      modifiedTime: seo.modifiedTime,
      section: seo.categoryNames[0],
    },
  }
}

export async function generateStaticParams(): Promise<{ article: string }[]> {
  const slugs = await getAllArticleSlugs()
  return slugs.map((article) => ({ article }))
}

function getMissingArticleMetadata(): Metadata {
  return {
    ...getPageMetadata({
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
    }),
    alternates: { canonical: null },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  }
}
