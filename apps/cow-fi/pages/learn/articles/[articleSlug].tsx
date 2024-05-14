import React from 'react'

import { GetStaticPaths, GetStaticProps } from 'next'
import { getArticleBySlug, getAllArticleSlugs, Article } from 'services/cms'

import { ArticleContent, GetInTouchSection } from '@/components/Article'
import Layout from '@/components/Layout'
import Head from 'next/head'
import Link from 'next/link'

const DATA_CACHE_TIME_SECONDS = 10 * 60 // 10 minutes

export interface BlogPostProps {
  article: Article
}

export default function BlogPostPage({ article }: BlogPostProps) {
  const { id } = article
  const { title, description, slug, seo } =
    article?.attributes || {}
  const { metaTitle, shareImage, metaDescription } = seo || {}
  const shareImageUrl = shareImage?.data?.attributes?.url

  // TODO: Add SEO information

  return (
    <Layout fullWidthGradientVariant={true} data-article-id={id} data-slug={slug}>
      <Head>
        <title>{title}</title>

        <meta name="description" content={metaDescription || description} key="description" />
        <meta property="og:description" content={metaDescription || description} key="og-description" />
        <meta property="og:title" content={metaTitle || title} key="og-title" />
        <meta name="twitter:title" content={title} key="twitter-title" />
        {shareImageUrl && (
          <>
            <meta key="ogImage" property="og:image" content={shareImageUrl} />
            <meta key="twitterImage" name="twitter:image" content={shareImageUrl} />
          </>
        )}
      </Head>

      <ArticleContent article={article} />


      <GetInTouchSection />
    </Layout>
  )
  
}

type ArticleQuery = { articleSlug: string }

export const getStaticPaths: GetStaticPaths<ArticleQuery> = async () => {
  const allSlugs = await getAllArticleSlugs()

  return {
    fallback: false,
    paths: allSlugs.map((articleSlug) => ({
      params: { articleSlug },
    })),
  }
}

export const getStaticProps: GetStaticProps<BlogPostProps, ArticleQuery> = async ({ params }) => {
  const article = params ? await getArticleBySlug(params.articleSlug) : null

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
