'use server'

import React from 'react'
import {
  Article,
  getAllArticleSlugs,
  getArticleBySlug,
  getArticles,
  getCategories,
  SharedRichTextComponent,
} from '../../../../services/cms'
import { ArticlePageComponent } from '@/components/ArticlePageComponent'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { stripHtmlTags } from '@/util/stripHTMLTags'
import { getPageMetadata } from '@/util/getPageMetadata'

function isRichTextComponent(block: any): block is SharedRichTextComponent {
  return block.body !== undefined
}

type Props = {
  params: Promise<{ article: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const articleSlug = (await params).article

  if (!articleSlug) return {}

  const article = await getArticleBySlug(articleSlug)
  const attributes = article?.attributes
  const { title, blocks, description, cover } = attributes || {}
  const coverImageUrl = cover?.data?.attributes?.url

  const content =
    blocks?.map((block: SharedRichTextComponent) => (isRichTextComponent(block) ? block.body : '')).join(' ') || ''
  const plainContent = stripHtmlTags(content)

  return getPageMetadata({
    absoluteTitle: `${title} - CoW DAO`,
    description: description
      ? stripHtmlTags(description)
      : plainContent.length > 150
        ? stripHtmlTags(plainContent.substring(0, 147)) + '...'
        : stripHtmlTags(plainContent),
    image: coverImageUrl,
  })
}

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs()

  return slugs.map((article) => ({ article }))
}

export default async function ArticlePage({ params }: Props) {
  const articleSlug = (await params).article
  const article = await getArticleBySlug(articleSlug)

  if (!article) {
    return notFound()
  }

  const articlesResponse = await getArticles()
  const articles = articlesResponse.data

  // Fetch featured articles
  const featuredArticlesResponse = await getArticles({
    filters: {
      featured: {
        $eq: true,
      },
    },
    pageSize: 7, // Limit to 7 articles
  })
  const featuredArticles = featuredArticlesResponse.data

  const randomArticles = getRandomArticles(articles, 3)
  const categoriesResponse = await getCategories()
  const allCategories =
    categoriesResponse?.map((category: any) => ({
      name: category?.attributes?.name || '',
      slug: category?.attributes?.slug || '',
    })) || []

  return (
    <ArticlePageComponent
      article={article}
      articles={articles}
      randomArticles={randomArticles}
      featuredArticles={featuredArticles}
      allCategories={allCategories}
    />
  )
}

function getRandomArticles(articles: Article[], count: number): Article[] {
  const shuffled = articles.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}
