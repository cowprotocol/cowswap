import React from 'react'

import { GetStaticPaths, GetStaticProps } from 'next'
import { getArticleBySlug, getAllArticleSlugs, Article } from 'services/cms'

import { ArticleContent } from '@/components/Article'

const DATA_CACHE_TIME_SECONDS = 10 * 60 // 10 minutes



export interface BlogPostProps {
  article: Article
}

export default function BlogPostPage({ article }: BlogPostProps) {
  return <ArticleContent article={article} />
}

type ArticleQuery = { articleSlug: string}

export const getStaticPaths: GetStaticPaths<ArticleQuery> = async () => {
  const allSlugs = await getAllArticleSlugs()

  return {
    fallback: false,
    paths: allSlugs.map((articleSlug) => ({
      params: { articleSlug }
    })),
  }
}

export const getStaticProps: GetStaticProps<BlogPostProps, ArticleQuery> = async ({ params }) => {
  const article = await getArticleBySlug(params.articleSlug)

  if (!article) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      article,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
