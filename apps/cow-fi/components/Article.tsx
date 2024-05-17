import Link from 'next/link'

import React from 'react'
import ReactMarkdown from 'react-markdown'

import { Color } from '@/styles/variables'
import {
  Article,
  ArticleBlock,
  ArticleCover,
  SharedMediaComponent,
  SharedQuoteComponent,
  SharedRichTextComponent,
  SharedSliderComponent,
  SharedVideoEmbedComponent,
  isSharedMediaComponent,
  isSharedQuoteComponent,
  isSharedRichTextComponent,
  isSharedSliderComponent,
  isSharedVideoEmbedComponent,
} from 'services/cms'
import styled from 'styled-components'
import { formatDate } from 'util/formatDate'
import { Section, SectionContent, SubTitle } from './Home/index.styles'
import SocialList from './SocialList'
import { CONFIG } from '@/const/meta'

const ArticleListWrapper = styled.ul`
  display: flex;
  flex-flow: column wrap;
  list-style-type: none;
  padding: 0;
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

  a.link {
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
  padding: 0;

  p, p a, strong {
    font-size: 1.8rem;
  }

  p {
    line-height: 1.8;
    margin: 2rem 0;
  }

  h2 {
    font-size: 24px;
    font-weight: bold;
    margin: 2.5rem 0 1.5rem 0;
  }

  li {
    line-height: 32px;
    margin: 1.5rem 0;
  }

  img {
    max-width: 100%;
  }

  strong {
    color: ${Color.text1};
  }
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

const IMAGE_WIDTH = 1000
const ArticleBlockWrapper = styled.li``

type ArticleAttributes = Article['attributes']

interface ArticleListProps {
  articles: Article[]
}

export function ArticleList({ articles }: ArticleListProps) {
  return (
    <ArticleListWrapper>
      {articles.map((article) => (
        <ArticleItem key={article?.attributes?.slug} article={article} />
      ))}
    </ArticleListWrapper>
  )
}

export interface ArticleItemProps {
  article: Article
}

export function ArticleItem({ article }: ArticleItemProps) {
  if (!article.attributes) return null

  const { slug, title, description, publishedAt, categories, cover, authorsBio } = article.attributes
  return (
    <ArticleItemWrapper key={slug} data-slug={slug} data-id={article.id}>
      <Link className="link" href={`/learn/articles/${slug}`} passHref>
        {title}
      </Link>
      <ArticleSubtitle dateIso={publishedAt!} authorsBio={authorsBio} />
      <ArticleDescription>{description}</ArticleDescription>
    </ArticleItemWrapper>
  )
}



export interface ArticleProps {
  article: Article
}

function CoverImage({ cover }: { cover: ArticleCover | undefined }) {
  if (!cover || !cover?.data?.attributes) return null
  const { url, width, height, alternativeText  } = cover?.data?.attributes

  if (!url || !width || !height) return null

  const actualWidth = Math.min(width, IMAGE_WIDTH)
  const actualHeight = (actualWidth / width) * height
  return (
    <img src={url} alt={alternativeText || "cover"} width={actualWidth} height={actualHeight} />
  )
}

export function ArticleContent({ article }: ArticleProps) {
  const { title, description, publishedAt, seo, authorsBio, blocks, categories, cover, createdBy } =
    article?.attributes || {}
  const { shareImage } = seo || {}
  const shareImageUrl = shareImage?.data?.attributes?.url  

  return (
    <>
      <Section fullWidth padding="0 8rem 4rem 8rem">
        <SectionContent flow="column">
          <div className="container">
            <h3>{title}</h3>
            <SubTitle color={Color.text1} lineHeight={1.4} maxWidth={70}>
              {description}
            </SubTitle>
            <ArticleSubtitle dateIso={publishedAt!} authorsBio={authorsBio} />
          </div> 
        </SectionContent>
      </Section>

      

      <Section fullWidth colorVariant={'white'} flow="column" gap={14} padding="4rem 8rem 12rem 8rem">
        <SectionContent flow={'row'} maxWidth={100} textAlign={'left'}>
          <div className="container">
            <CoverImage cover={cover} />

            <ArticleContentWrapper>
                {blocks && (
                  <ArticleBlocksWrapper>
                    {blocks.map((block) => (
                      <ArticleBlockComponent key={block.id} block={block} />
                    ))}
                  </ArticleBlocksWrapper>
                )}
                <Link href="/learn">Go back</Link>
              </ArticleContentWrapper>
          </div>
        </SectionContent>
      </Section>

      
      {/* <Section fullWidth colorVariant={'white'} flow="column" gap={14} padding="4rem 8rem 12rem 8rem">
        <SectionContent flow={'row'} maxWidth={100} textAlign={'left'}>
          <div className="container">
            <h3>DEBUG DATA</h3>
            <ArticleContentWrapper>

            <pre style={{ lineHeight: '1.5em', fontSize: '14px' }}>{JSON.stringify(article, null, 2)}</pre> 
            </ArticleContentWrapper>
          </div>
        </SectionContent>
      </Section>  */}
     
    </>    
  )
}

export interface ArticleDateProps {
  dateIso: string
  authorsBio?:
    | {
        data?: {
          id?: number
          attributes?: Record<string, never>
        }
      }
    | undefined
}
export function ArticleSubtitle({ dateIso, authorsBio }: ArticleDateProps) {
  const date = new Date(dateIso)
  const author = authorsBio?.data?.attributes?.name

  return (
    <ArticleSubtitleWrapper>
      <div>
        Published on: <span>{formatDate(date)}</span>
      </div>

      {author && (
        <div>
          Author: <span>{author}</span>
        </div>
      )}
    </ArticleSubtitleWrapper>
  )
}

export function GetInTouchSection() {
  return (
    <Section fullWidth>
      <SectionContent flow={'column'}>
        <div>
          <h3>Get in touch</h3>
          <SubTitle maxWidth={60} color={Color.text1} lineHeight={1.4}>
            You would like to suggest or even make your own article, reach out on Twitter or Discord!
          </SubTitle>
          <SocialList social={CONFIG.social} color={Color.darkBlue} />
        </div>
      </SectionContent>
    </Section>
  )
}

export interface ArticleBlockProps {
  block: ArticleBlock
}

export function ArticleBlockComponent({ block }: ArticleBlockProps) {
  console.log('ArticleBlockComponent', block)

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

  return <ArticleBlockWrapper>{item}</ArticleBlockWrapper>
}

export function ArticleSharedMediaComponent({ sharedMedia }: { sharedMedia: SharedMediaComponent }) {
  return <>SharedMediaComponent: {JSON.stringify(sharedMedia)}</>
}

export function ArticleSharedQuoteComponent({ sharedQuote }: { sharedQuote: SharedQuoteComponent }) {
  return <>SharedMediaComponent: {JSON.stringify(sharedQuote)}</>
}

export function ArticleSharedRichTextComponent({ sharedRichText }: { sharedRichText: SharedRichTextComponent }) {
  return <ReactMarkdown>{sharedRichText.body}</ReactMarkdown>
}

export function ArticleSharedSliderComponent({ sharedSlider }: { sharedSlider: SharedSliderComponent }) {
  return <>SharedMediaComponent: {JSON.stringify(sharedSlider)}</>
}

export function ArticleSharedVideoEmbedComponent({
  sharedVideoEmbed,
}: {
  sharedVideoEmbed: SharedVideoEmbedComponent
}) {
  return <>SharedMediaComponent: {JSON.stringify(sharedVideoEmbed)}</>
}
