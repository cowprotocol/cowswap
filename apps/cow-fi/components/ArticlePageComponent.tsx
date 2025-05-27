'use client'

import { useMemo } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { CmsImage, Color, Media } from '@cowprotocol/ui'

import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import styled from 'styled-components/macro'

import { CategoryLinks } from '@/components/CategoryLinks'
import { Link, LinkType } from '@/components/Link'
import { SearchBar } from '@/components/SearchBar'
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
  SectionTitleDescription,
  StickyMenu,
} from '@/styles/styled'
import { formatDate } from '@/util/formatDate'
import { stripHtmlTags } from '@/util/stripHTMLTags'
import { CowFiCategory } from 'src/common/analytics/types'

import { useLazyLoadImages } from '../hooks/useLazyLoadImages'
import useWebShare from '../hooks/useWebShare'
import { Article, SharedRichTextComponent } from '../services/cms'

interface ArticlePageProps {
  article: Article
  randomArticles: Article[]
  featuredArticles: Article[]
  allCategories: { name: string; slug: string }[]
}

export function ArticlePageComponent({ article, randomArticles, featuredArticles, allCategories }: ArticlePageProps) {
  const attributes: {
    title?: string
    description?: string
    blocks?: SharedRichTextComponent[]
    publishedAt?: string
    publishDate?: string
    publishDateVisible?: boolean
    categories?: any
    cover?: any
  } = article.attributes || {}
  const { title, blocks, publishedAt, categories } = attributes
  const publishDate = attributes.publishDate || null
  const publishDateVisible = attributes.publishDateVisible ?? true
  const content =
    blocks?.map((block: SharedRichTextComponent) => (isRichTextComponent(block) ? block.body : '')).join(' ') || ''
  const plainContent = stripHtmlTags(content)

  const analytics = useCowAnalytics()
  const { share, message } = useWebShare()

  const handleShareClick = () => {
    analytics.sendEvent({
      category: CowFiCategory.KNOWLEDGEBASE,
      action: 'Share article',
      label: title,
    })
    share({
      title: title || 'CoW DAO Article',
      text: plainContent.split(' ').slice(0, 50).join(' ') + '...',
      url: window.location.href,
    })
  }

  return (
    <Wrapper>
      <CategoryLinks allCategories={allCategories} />

      <SearchBar />
      <ContainerCard gap={62} gapMobile={42} margin="0 auto" centerContent>
        <ArticleContent>
          <Breadcrumbs>
            <Link
              href="/"
              onClick={() =>
                analytics.sendEvent({
                  category: CowFiCategory.KNOWLEDGEBASE,
                  action: 'Click breadcrumb',
                  label: 'home',
                })
              }
            >
              Home
            </Link>
            <Link
              href="/learn"
              onClick={() =>
                analytics.sendEvent({
                  category: CowFiCategory.KNOWLEDGEBASE,
                  action: 'Click breadcrumb',
                  label: 'knowledge-base',
                })
              }
            >
              Knowledge Base
            </Link>
            <span>{title}</span>
          </Breadcrumbs>

          {categories && Array.isArray(categories.data) && categories.data.length > 0 && (
            <CategoryTags>
              {categories.data.map((category: { id: string; attributes?: { slug?: string; name?: string } }) => {
                const categoryName = category.attributes?.name
                if (!categoryName) return null

                return (
                  <Link
                    key={category.id}
                    href={`/learn/topic/${category.attributes?.slug ?? ''}`}
                    onClick={() =>
                      analytics.sendEvent({
                        category: CowFiCategory.KNOWLEDGEBASE,
                        action: 'Click category',
                        label: categoryName,
                      })
                    }
                  >
                    {categoryName}
                  </Link>
                )
              })}
            </CategoryTags>
          )}

          <ArticleMainTitle>{title}</ArticleMainTitle>

          <ArticleSubtitle dateIso={(publishDate || publishedAt)!} dateVisible={publishDateVisible} content={content} />
          <BodyContent>
            {blocks &&
              blocks.map((block: SharedRichTextComponent) =>
                isRichTextComponent(block) ? (
                  <ArticleSharedRichTextComponent key={block.id} sharedRichText={block} />
                ) : null,
              )}

            <br />
            <Link
              onClick={handleShareClick}
              asButton
              linkType={LinkType.SectionTitleButton}
              color={Color.neutral98}
              bgColor={Color.neutral10}
            >
              Share article
            </Link>

            {message && (
              <SectionTitleDescription textAlign="left" margin="16px 0 0" fontSize={21}>
                {message}
              </SectionTitleDescription>
            )}
          </BodyContent>
        </ArticleContent>

        <StickyMenu>
          <b>Featured Articles</b>
          <RelatedArticles>
            <ul>
              {featuredArticles.map((article) => {
                const articleTitle = article.attributes?.title
                if (!articleTitle) return null

                return (
                  <li key={article.id}>
                    <a
                      href={`/learn/${article.attributes?.slug}`}
                      onClick={() =>
                        analytics.sendEvent({
                          category: CowFiCategory.KNOWLEDGEBASE,
                          action: 'Click featured article',
                          label: articleTitle,
                        })
                      }
                    >
                      {articleTitle}
                    </a>
                  </li>
                )
              })}
            </ul>
          </RelatedArticles>
        </StickyMenu>
      </ContainerCard>

      {/* Read More Section */}
      <ContainerCard bgColor={Color.neutral98} touchFooter>
        <ContainerCardSection>
          <ContainerCardSectionTop>
            <ContainerCardSectionTopTitle>Read more</ContainerCardSectionTopTitle>
          </ContainerCardSectionTop>
          <ArticleList>
            {randomArticles.map((article) => {
              const attrs = article.attributes
              if (!attrs?.title || !attrs?.slug) return null
              const coverData = attrs.cover?.data
              const imageUrl = coverData?.attributes?.url

              return (
                <ArticleCard
                  key={article.id}
                  href={`/learn/${attrs.slug}`}
                  onClick={() =>
                    analytics.sendEvent({
                      category: CowFiCategory.KNOWLEDGEBASE,
                      action: 'Click read more',
                      label: attrs.title,
                    })
                  }
                >
                  {imageUrl && (
                    <ArticleImage>
                      <CmsImage
                        src={imageUrl}
                        alt={`Cover image for article: ${attrs.title}`}
                        width={700}
                        height={200}
                      />
                    </ArticleImage>
                  )}
                  <ArticleTitle>{attrs.title}</ArticleTitle>
                </ArticleCard>
              )
            })}
          </ArticleList>
        </ContainerCardSection>
      </ContainerCard>
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

function ArticleSubtitle({
  dateIso,
  content,
  dateVisible,
}: {
  dateIso: string
  content: string
  dateVisible: boolean
}) {
  const date = new Date(dateIso)
  const readTime = calculateReadTime(content)

  return (
    <ArticleSubtitleWrapper>
      <div>
        <span>{readTime}</span>
      </div>

      {dateVisible && (
        <>
          <div>·</div>
          <div>
            <span>Published {formatDate(date)}</span>
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

function isRichTextComponent(block: any): block is SharedRichTextComponent {
  return block.body !== undefined
}

function ArticleSharedRichTextComponent({ sharedRichText }: { sharedRichText: SharedRichTextComponent }) {
  const { replaceImageUrls, LazyImage } = useLazyLoadImages()

  const processedContent = useMemo(() => {
    return sharedRichText.body ? replaceImageUrls(sharedRichText.body) : ''
  }, [sharedRichText.body, replaceImageUrls])

  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      components={{
        img: ({ src, alt, ...props }) => {
          if (!src) return null
          return <LazyImage src={src} alt={alt || ''} {...props} width={725} height={400} />
        },
      }}
    >
      {processedContent}
    </ReactMarkdown>
  )
}
