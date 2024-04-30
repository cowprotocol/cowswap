import Link from 'next/link'

import React from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'

import { Color, Media } from '@/styles/variables'
import { Article, ArticleBlock, SharedMediaComponent, SharedQuoteComponent, SharedRichTextComponent, SharedSliderComponent, SharedVideoEmbedComponent, isSharedMediaComponent, isSharedQuoteComponent, isSharedRichTextComponent, isSharedSliderComponent, isSharedVideoEmbedComponent } from "services/cms"
import styled from 'styled-components'
import { formatDate } from 'util/formatDate'

const ArticleListWrapper = styled.ul`
  display: flex;
  flex-flow: column wrap;
  list-style-type: none;
  padding: 0

  
`
const ArticleContentWrapper = styled.article`
a {
  font-size: 1.2rem;
  color: white;
  margin: 1rem 0 0.5rem 0;
}
`

const ArticleItemWrapper = styled.li`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 126rem;
  
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 1.5rem 0;
  padding: 2.5rem;
  color: ${Color.text1};

  a {
    font-size: 2rem;
    text-decoration: none;
    color: ${Color.darkBlue};
    line-height: 1.5;
    margin-bottom: 1.5rem;
  }
`

const ArticleBlocksWrapper = styled.ul`
  display: flex;
  flex-flow: column wrap;
  list-style-type: none;
  padding: 0
`

const ArticleDescription = styled.p`
  font-size: 1.5rem;
  color: ${Color.text1};
  line-height: 1.5;
  padding: 2rem 0 0 0;
`

const ArticleSubtitleWrapper = styled.div`
  color: ${Color.grey3};
  font-weight: bold;
  font-size: 1.2rem;
  display: flex;
  flex-flow: row wrap;
  gap: 10px;  

  > div span {
    font-weight: normal;  
  }
`


const ArticleBlockWrapper = styled.li`
`

type ArticleAttributes = Article['attributes']

interface ArticleListProps {
  articles: Article[]
}

export function ArticleList({articles}: ArticleListProps) {
  return (
    <ArticleListWrapper>
      {articles.map((article) => <ArticleItem key={article?.attributes?.slug} article={article} />)}
    </ArticleListWrapper>
  )
}


export interface ArticleItemProps {
  article: Article
}

export function ArticleItem ({article}: ArticleItemProps) {
  const { slug,title, description, publishedAt, categories, cover, authorsBio } = article?.attributes
  // TODO: For details: seo, §
  return (
    <ArticleItemWrapper key={slug} data-slug={slug} data-id={article.id}>
      <Link href={`/learn/articles/${slug}`}>{title}</Link>
      <ArticleSubtitle dateIso={publishedAt} authorsBio={authorsBio} />
      <ArticleDescription>{description}</ArticleDescription>
    </ArticleItemWrapper>
  )
}

export interface ArticleProps {
  article: Article
}

export function ArticleContent ({article}: ArticleProps) {
  const { id } = article
  const { title, description, publishedAt, slug, seo, authorsBio, blocks, categories, cover, createdBy } = article?.attributes || {}
  const { metaTitle, shareImage, metaDescription } = seo || {}
  const shareImageUrl = shareImage?.data?.attributes?.url


  

  return (
    <>
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

      <Layout fullWidthGradientVariant={false}>
        <ArticleContentWrapper data-slug={slug} data-id={id}>
          <code>
            {JSON.stringify(article)}
          </code>

          <h1>{title}</h1>
          <ArticleSubtitle dateIso={publishedAt} authorsBio={authorsBio} />
          <p>{description}</p>

          {blocks && (
          <ArticleBlocksWrapper>
            {blocks.map(block => <ArticleBlockComponent key={block.id} block={block} />)}
          </ArticleBlocksWrapper>
          )}

          <Link href="/learn">Go back</Link>
        </ArticleContentWrapper>
      </Layout>
    </>
  )
}


export interface ArticleDateProps {
  dateIso: string
  authorsBio: ArticleAttributes['authorsBio']
}
export function ArticleSubtitle({ dateIso, authorsBio }: ArticleDateProps){
  const date = new Date(dateIso)
  const author = authorsBio?.data?.attributes?.name

  return <ArticleSubtitleWrapper>
    <div>
      Published on: <span>{formatDate(date)}</span>
    </div>

    {author  && (
      <div>
        Author: <span>{author}</span>
      </div>
    )}
    </ArticleSubtitleWrapper>
}

export interface ArticleBlockProps {
  block: ArticleBlock
}

export function ArticleBlockComponent ({block}: ArticleBlockProps) {
  const item = (() => {
    const component = block.__component
    if (isSharedMediaComponent(block)) {
      return <ArticleSharedMediaComponent sharedMedia={block} />
    }

    if (isSharedQuoteComponent(block)) {
      return <ArticleSharedQuoteComponent sharedQuote={block} />
    }

    if (isSharedRichTextComponent(block)) {
      return <ArticleSharedRichTextComponent sharedRichText={block} />
    }

    if (isSharedSliderComponent(block)) {
      return <ArticleSharedSliderComponent sharedSlider={block} />
    }

    if (isSharedVideoEmbedComponent(block)) {
      return <ArticleSharedVideoEmbedComponent sharedVideoEmbed={block} />
    }

    // Unknown media time
    console.error('Unknown Article Block: ' + component)
    return null
  })()

  return (
    <ArticleBlockWrapper>
      {item}
    </ArticleBlockWrapper>
  )
}

export function ArticleSharedMediaComponent({sharedMedia}: {sharedMedia: SharedMediaComponent}) {
  return <>SharedMediaComponent: {JSON.stringify(sharedMedia)}</>
}

export function ArticleSharedQuoteComponent({sharedQuote}: {sharedQuote: SharedQuoteComponent}) {
  return <>SharedMediaComponent: {JSON.stringify(sharedQuote)}</>
}

export function ArticleSharedRichTextComponent({sharedRichText}: {sharedRichText: SharedRichTextComponent}) {
  return <>SharedMediaComponent: {JSON.stringify(sharedRichText)}</>
}

export function ArticleSharedSliderComponent({ sharedSlider }: {sharedSlider: SharedSliderComponent}) {
  return <>SharedMediaComponent: {JSON.stringify(sharedSlider)}</>
}

export function ArticleSharedVideoEmbedComponent({ sharedVideoEmbed }: {sharedVideoEmbed: SharedVideoEmbedComponent}) {
  return <>SharedMediaComponent: {JSON.stringify(sharedVideoEmbed)}</>
}
