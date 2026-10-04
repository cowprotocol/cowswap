'use client'

import type { ImgHTMLAttributes, ReactNode } from 'react'

import { Media, UI } from '@cowprotocol/ui'

import { usePathname } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import styled, { createGlobalStyle } from 'styled-components/macro'

import { Article, Resource, SharedRichTextComponent } from '../services/cms'

import { CategoryLinks } from '@/components/CategoryLinks'
import { CmsImage } from '@/components/CmsImage'
import { LazyImage } from '@/components/LazyImage'
import { Link } from '@/components/Link'
import { SearchBar } from '@/components/SearchBar'
import { ShareBlock } from '@/components/ShareBlock'
import { getCampaignLabel } from '@/const/resources'
import {
  ArticleCard,
  ArticleContent,
  ArticleImage,
  ArticleList,
  ArticleMainTitle,
  ArticleSubtitleWrapper,
  ArticleTitle,
  BodyContent,
  Breadcrumbs,
  ContainerCard,
  ContainerCardSection,
  ContainerCardSectionTop,
  ContainerCardSectionTopTitle,
  RelatedArticles,
  StickyMenu,
} from '@/styles/styled'
import { formatDate } from '@/util/formatDate'
import { remarkAllowedHtmlImages, sanitizeCmsMarkdown } from '@/util/markdownHtmlImages'

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || ''

const PageBackground = createGlobalStyle`
  body {
    background: var(${UI.COLOR_NEUTRAL_98});
  }
`

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 24px auto 0;
  gap: 34px;
  max-width: 1760px;

  ${Media.upToMedium()} {
    margin: 0 auto;
    gap: 24px;
  }
`

interface ResourcePageComponentProps {
  resource: Resource
  featuredArticles: Article[]
  readMoreArticles: Article[]
  allCategories: { name: string; slug: string }[]
}

export function ResourcePageComponent({
  resource,
  featuredArticles,
  readMoreArticles,
  allCategories,
}: ResourcePageComponentProps): ReactNode {
  const attributes = resource.attributes
  const title = attributes?.title
  const campaign = attributes?.campaign
  const blocks = attributes?.blocks
  const publishedAt = attributes?.publishedAt
  const publishDate = attributes?.publishDate || null
  const publishDateVisible = attributes?.publishDateVisible ?? true
  const content =
    blocks?.map((block: SharedRichTextComponent) => (isRichTextComponent(block) ? block.body : '')).join(' ') || ''
  const pathname = usePathname()
  const fallbackUrl = buildFallbackUrl(pathname)
  const shareTitle = title || 'CoW DAO Resource'

  if (!campaign || !attributes?.slug) {
    return null
  }

  const campaignLabel = getCampaignLabel(campaign)

  return (
    <Wrapper>
      <PageBackground />
      <CategoryLinks allCategories={allCategories} />
      <SearchBar />
      <ContainerCard gap={62} gapMobile={42} margin="0 auto" centerContent>
        <ArticleContent>
          <Breadcrumbs>
            <Link href="/">Home</Link>
            <Link href="/resources">Resources</Link>
            <Link href={`/resources/${campaign}`}>{campaignLabel}</Link>
            <span>{title}</span>
          </Breadcrumbs>

          <ArticleMainTitle>{title}</ArticleMainTitle>

          <ResourceSubtitle
            dateIso={publishDate || publishedAt || ''}
            dateVisible={publishDateVisible}
            content={content}
          />

          <BodyContent>
            {blocks?.map((block) =>
              isRichTextComponent(block) ? <ResourceRichText key={block.id} sharedRichText={block} /> : null,
            )}
            <ShareBlock url={fallbackUrl} title={shareTitle} onShare={() => undefined} />
          </BodyContent>
        </ArticleContent>
        <FeaturedArticles articles={featuredArticles} />
      </ContainerCard>
      <ReadMore articles={readMoreArticles} />
    </Wrapper>
  )
}

function buildFallbackUrl(pathname: string): string {
  if (!SITE_ORIGIN) return ''
  try {
    return new URL(pathname, SITE_ORIGIN).toString()
  } catch {
    return ''
  }
}

function FeaturedArticles({ articles }: { articles: Article[] }): ReactNode {
  const items = articles.filter((article) => article.attributes?.title && article.attributes?.slug)
  if (items.length === 0) return null

  return (
    <StickyMenu>
      <b>Featured Posts</b>
      <RelatedArticles>
        <ul>
          {items.map((article) => {
            const articleTitle = article.attributes?.title
            const articleSlug = article.attributes?.slug
            if (!articleTitle || !articleSlug) return null

            return (
              <li key={article.id}>
                <a href={`/learn/${articleSlug}`}>{articleTitle}</a>
              </li>
            )
          })}
        </ul>
      </RelatedArticles>
    </StickyMenu>
  )
}

function isRichTextComponent(block: unknown): block is SharedRichTextComponent {
  return (
    typeof block === 'object' &&
    block !== null &&
    'body' in block &&
    typeof (block as { body?: unknown }).body === 'string'
  )
}

function MarkdownImage({ src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement>): ReactNode {
  const dataSrc = (props as Record<string, unknown>)['data-src']
  const resolvedSrc = typeof dataSrc === 'string' ? dataSrc : src
  if (!resolvedSrc) return null
  return <LazyImage src={resolvedSrc} alt={alt || ''} {...props} width={725} height={400} />
}

function ReadMore({ articles }: { articles: Article[] }): ReactNode {
  const items = articles.filter((article) => article.attributes?.title && article.attributes?.slug)
  if (items.length === 0) return null

  return (
    <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_98})`} touchFooter>
      <ContainerCardSection>
        <ContainerCardSectionTop>
          <ContainerCardSectionTopTitle>Read More</ContainerCardSectionTopTitle>
        </ContainerCardSectionTop>
        <ArticleList>
          {items.map((article) => {
            const attrs = article.attributes
            const articleTitle = attrs?.title
            const slug = attrs?.slug
            if (!articleTitle || !slug) return null
            const imageUrl = attrs?.cover?.data?.attributes?.url

            return (
              <ArticleCard key={article.id} href={`/learn/${slug}`}>
                {imageUrl && (
                  <ArticleImage>
                    <CmsImage
                      src={imageUrl}
                      alt={`Cover image for article: ${articleTitle}`}
                      width={700}
                      height={200}
                    />
                  </ArticleImage>
                )}
                <ArticleTitle>{articleTitle}</ArticleTitle>
              </ArticleCard>
            )
          })}
        </ArticleList>
      </ContainerCardSection>
    </ContainerCard>
  )
}

function readTime(text: string): string {
  const wordsPerMinute = 200
  const time = Math.ceil(text.split(/\s+/).length / wordsPerMinute)
  return `${time} min read`
}

function ResourceRichText({ sharedRichText }: { sharedRichText: SharedRichTextComponent }): ReactNode {
  const content = sanitizeCmsMarkdown(sharedRichText.body || '')

  return (
    <ReactMarkdown skipHtml remarkPlugins={[remarkAllowedHtmlImages]} components={{ img: MarkdownImage }}>
      {content}
    </ReactMarkdown>
  )
}

function ResourceSubtitle({
  dateIso,
  content,
  dateVisible,
}: {
  dateIso: string
  content: string
  dateVisible: boolean
}): ReactNode {
  const date = dateIso ? new Date(dateIso) : null
  const showDate = Boolean(dateVisible && date && !Number.isNaN(date.getTime()))
  const formattedDate = showDate && date ? formatDate(date) : null

  return (
    <ArticleSubtitleWrapper>
      <div>
        <span>{readTime(content)}</span>
      </div>
      {formattedDate && (
        <>
          <div>·</div>
          <div>
            <span>Published {formattedDate}</span>
          </div>
        </>
      )}
    </ArticleSubtitleWrapper>
  )
}
