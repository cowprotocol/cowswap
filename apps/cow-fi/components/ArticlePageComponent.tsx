'use client'

import { useMemo } from 'react'
import type { ImgHTMLAttributes, ReactNode } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { CmsImage, Media, UI } from '@cowprotocol/ui'

import { usePathname } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { CowFiCategory } from 'src/common/analytics/types'
import styled from 'styled-components/macro'

import { Article, SharedRichTextComponent } from '../services/cms'

import { CategoryLinks } from '@/components/CategoryLinks'
import { LazyImage } from '@/components/LazyImage'
import { Link } from '@/components/Link'
import { SearchBar } from '@/components/SearchBar'
import { ShareBlock } from '@/components/ShareBlock'
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
  CategoryTags,
  ContainerCard,
  ContainerCardSection,
  ContainerCardSectionTop,
  ContainerCardSectionTopTitle,
  RelatedArticles,
  StickyMenu,
} from '@/styles/styled'
import { formatDate } from '@/util/formatDate'
import { replaceImageUrls } from '@/util/lazyLoadImages'

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || ''

type ArticleAttributes = NonNullable<Article['attributes']>
type ArticleCategories = ArticleAttributes['categories']

function buildFallbackUrl(pathname: string): string {
  if (!SITE_ORIGIN) return ''
  try {
    return new URL(pathname, SITE_ORIGIN).toString()
  } catch {
    return ''
  }
}

interface ArticlePageProps {
  article: Article
  randomArticles: Article[]
  featuredArticles: Article[]
  allCategories: { name: string; slug: string }[]
}

export function ArticlePageComponent({
  article,
  randomArticles,
  featuredArticles,
  allCategories,
}: ArticlePageProps): ReactNode {
  const attributes = article.attributes
  const title = attributes?.title
  const blocks = attributes?.blocks
  const publishedAt = attributes?.publishedAt
  const categories = attributes?.categories
  const publishDate = attributes?.publishDate || null
  const publishDateVisible = attributes?.publishDateVisible ?? true
  const content =
    blocks?.map((block: SharedRichTextComponent) => (isRichTextComponent(block) ? block.body : '')).join(' ') || ''
  const pathname = usePathname()
  const fallbackUrl = buildFallbackUrl(pathname)
  const shareTitle = title || 'CoW DAO Article'

  const analytics = useCowAnalytics()
  const sendAnalyticsEvent = (action: string, label?: string): void => {
    analytics.sendEvent({
      category: CowFiCategory.KNOWLEDGEBASE,
      action,
      label,
    })
  }

  const handleShareClick = (): void => sendAnalyticsEvent('Share article', shareTitle)
  const handleBreadcrumbClick = (label: string): void => sendAnalyticsEvent('Click breadcrumb', label)
  const handleCategoryClick = (label: string): void => sendAnalyticsEvent('Click category', label)
  const handleFeaturedClick = (label: string): void => sendAnalyticsEvent('Click featured article', label)
  const handleReadMoreClick = (label: string): void => sendAnalyticsEvent('Click read more', label)

  return (
    <Wrapper>
      <CategoryLinks allCategories={allCategories} />

      <SearchBar />
      <ContainerCard gap={62} gapMobile={42} margin="0 auto" centerContent>
        <ArticleContent>
          <ArticleHeader
            title={title}
            categories={categories}
            dateIso={publishDate || publishedAt || ''}
            dateVisible={publishDateVisible}
            content={content}
            onBreadcrumbClick={handleBreadcrumbClick}
            onCategoryClick={handleCategoryClick}
          />
          <ArticleBody blocks={blocks} shareTitle={shareTitle} shareUrl={fallbackUrl} onShare={handleShareClick} />
        </ArticleContent>

        <FeaturedArticlesMenu articles={featuredArticles} onClick={handleFeaturedClick} />
      </ContainerCard>

      <ReadMoreSection articles={randomArticles} onClick={handleReadMoreClick} />
    </Wrapper>
  )
}

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

interface ArticleHeaderProps {
  title?: string
  categories?: ArticleCategories
  dateIso: string
  dateVisible: boolean
  content: string
  onBreadcrumbClick: (label: string) => void
  onCategoryClick: (label: string) => void
}

function ArticleHeader({
  title,
  categories,
  dateIso,
  dateVisible,
  content,
  onBreadcrumbClick,
  onCategoryClick,
}: ArticleHeaderProps): ReactNode {
  return (
    <>
      <Breadcrumbs>
        <Link href="/" onClick={() => onBreadcrumbClick('home')}>
          Home
        </Link>
        <Link href="/learn" onClick={() => onBreadcrumbClick('knowledge-base')}>
          Knowledge Base
        </Link>
        <span>{title}</span>
      </Breadcrumbs>

      <ArticleCategories categories={categories} onCategoryClick={onCategoryClick} />

      <ArticleMainTitle>{title}</ArticleMainTitle>

      <ArticleSubtitle dateIso={dateIso} dateVisible={dateVisible} content={content} />
    </>
  )
}

interface ArticleCategoriesProps {
  categories?: ArticleCategories
  onCategoryClick: (label: string) => void
}

function ArticleCategories({ categories, onCategoryClick }: ArticleCategoriesProps): ReactNode {
  if (!categories || !Array.isArray(categories.data) || categories.data.length === 0) return null

  return (
    <CategoryTags>
      {categories.data.map((category) => {
        const categoryName = category.attributes?.name
        const categorySlug = category.attributes?.slug
        const categoryId = category.id ?? categorySlug ?? categoryName
        if (!categoryName) return null
        if (categoryId === undefined) return null

        return (
          <Link
            key={categoryId}
            href={`/learn/topic/${categorySlug ?? ''}`}
            onClick={() => onCategoryClick(categoryName)}
          >
            {categoryName}
          </Link>
        )
      })}
    </CategoryTags>
  )
}

interface ArticleBodyProps {
  blocks?: SharedRichTextComponent[]
  shareUrl: string
  shareTitle: string
  onShare: () => void
}

function ArticleBody({ blocks, shareUrl, shareTitle, onShare }: ArticleBodyProps): ReactNode {
  return (
    <BodyContent>
      {blocks &&
        blocks.map((block) =>
          isRichTextComponent(block) ? <ArticleSharedRichTextComponent key={block.id} sharedRichText={block} /> : null,
        )}
      <ShareBlock url={shareUrl} title={shareTitle} onShare={onShare} />
    </BodyContent>
  )
}

interface FeaturedArticlesMenuProps {
  articles: Article[]
  onClick: (title: string) => void
}

function FeaturedArticlesMenu({ articles, onClick }: FeaturedArticlesMenuProps): ReactNode {
  return (
    <StickyMenu>
      <b>Featured Articles</b>
      <RelatedArticles>
        <ul>
          {articles.map((article) => {
            const articleTitle = article.attributes?.title
            const articleSlug = article.attributes?.slug
            if (!articleTitle || !articleSlug) return null

            return (
              <li key={article.id}>
                <a href={`/learn/${articleSlug}`} onClick={() => onClick(articleTitle)}>
                  {articleTitle}
                </a>
              </li>
            )
          })}
        </ul>
      </RelatedArticles>
    </StickyMenu>
  )
}

interface ReadMoreSectionProps {
  articles: Article[]
  onClick: (title: string) => void
}

function ReadMoreSection({ articles, onClick }: ReadMoreSectionProps): ReactNode {
  return (
    <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_98})`} touchFooter>
      <ContainerCardSection>
        <ContainerCardSectionTop>
          <ContainerCardSectionTopTitle>Read more</ContainerCardSectionTopTitle>
        </ContainerCardSectionTop>
        <ArticleList>
          {articles.map((article) => {
            const attrs = article.attributes
            const title = attrs?.title
            const slug = attrs?.slug
            if (!title || !slug) return null
            const coverData = attrs?.cover?.data
            const imageUrl = coverData?.attributes?.url

            return (
              <ArticleCard key={article.id} href={`/learn/${slug}`} onClick={() => onClick(title)}>
                {imageUrl && (
                  <ArticleImage>
                    <CmsImage src={imageUrl} alt={`Cover image for article: ${title}`} width={700} height={200} />
                  </ArticleImage>
                )}
                <ArticleTitle>{title}</ArticleTitle>
              </ArticleCard>
            )
          })}
        </ArticleList>
      </ContainerCardSection>
    </ContainerCard>
  )
}

function ArticleSubtitle({
  dateIso,
  content,
  dateVisible,
}: {
  dateIso: string
  content: string
  dateVisible: boolean
}): ReactNode {
  const date = dateIso ? new Date(dateIso) : null
  const readTime = calculateReadTime(content)
  const showDate = Boolean(dateVisible && date && !Number.isNaN(date.getTime()))

  return (
    <ArticleSubtitleWrapper>
      <div>
        <span>{readTime}</span>
      </div>

      {showDate && (
        <>
          <div>·</div>
          <div>
            <span>Published {formatDate(date!)}</span>
          </div>
        </>
      )}
    </ArticleSubtitleWrapper>
  )
}

function calculateReadTime(text: string): string {
  const wordsPerMinute = 200 // Average case.
  const textLength = text.split(/\s+/).length // Split by words
  const time = Math.ceil(textLength / wordsPerMinute)
  return `${time} min read`
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

function ArticleSharedRichTextComponent({ sharedRichText }: { sharedRichText: SharedRichTextComponent }): ReactNode {
  const processedContent = useMemo(() => {
    return sharedRichText.body ? replaceImageUrls(sharedRichText.body) : ''
  }, [sharedRichText.body])

  return (
    <ReactMarkdown rehypePlugins={[rehypeRaw]} components={{ img: MarkdownImage }}>
      {processedContent}
    </ReactMarkdown>
  )
}
