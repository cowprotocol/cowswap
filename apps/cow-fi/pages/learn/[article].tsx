import React from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
import styled from 'styled-components/macro'
import { Color, Media } from '@cowprotocol/ui'

import Layout from '@/components/Layout'
import {
  getArticles,
  getArticleBySlug,
  getAllArticleSlugs,
  getCategories,
  Article,
  SharedRichTextComponent,
} from 'services/cms'

import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { formatDate } from 'util/formatDate'
import { stripHtmlTags } from 'util/stripHTMLTags'
import { SearchBar } from '@/components/SearchBar'

import {
  Breadcrumbs,
  ContainerCard,
  ContainerCardSection,
  ContainerCardSectionTop,
  ArticleList,
  ArticleCard,
  ArticleImage,
  ArticleTitle,
  ContainerCardSectionTopTitle,
  ArticleContent,
  BodyContent,
  ArticleMainTitle,
  ArticleSubtitleWrapper,
  CategoryTags,
  CategoryLinks,
  StickyMenu,
  RelatedArticles,
  SectionTitleDescription,
} from '@/styles/styled'
import useWebShare from 'hooks/useWebShare'

import { Link, LinkType } from '@/components/Link'

import { CONFIG, DATA_CACHE_TIME_SECONDS } from '@/const/meta'
import { clickOnKnowledgeBase } from 'modules/analytics'
import { CmsImage } from '@cowprotocol/ui'

interface ArticlePageProps {
  siteConfigData: typeof CONFIG
  article: Article
  articles: Article[]
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

export function ArticleSubtitle({
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

export function ArticleSharedRichTextComponent({ sharedRichText }: { sharedRichText: SharedRichTextComponent }) {
  return <ReactMarkdown rehypePlugins={[rehypeRaw]}>{sharedRichText.body}</ReactMarkdown>
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

function getRandomArticles(articles: Article[], count: number): Article[] {
  const shuffled = articles.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export default function ArticlePage({
  siteConfigData,
  article,
  articles,
  randomArticles,
  featuredArticles,
  allCategories,
}: ArticlePageProps & {
  randomArticles: Article[]
  featuredArticles: Article[]
  allCategories: { name: string; slug: string }[]
}) {
  const attributes: {
    title?: string
    blocks?: SharedRichTextComponent[]
    publishedAt?: string
    publishDate?: string
    publishDateVisible?: boolean
    categories?: any
    cover?: any
  } = article.attributes || {}
  const { title, blocks, publishedAt, categories, cover } = attributes
  const publishDate = attributes.publishDate || null
  const publishDateVisible = attributes.publishDateVisible ?? true
  const content =
    blocks?.map((block: SharedRichTextComponent) => (isRichTextComponent(block) ? block.body : '')).join(' ') || ''
  const plainContent = stripHtmlTags(content)
  const coverImageUrl = cover?.data?.attributes?.url

  const { share, message } = useWebShare()

  const handleShareClick = () => {
    share({
      title: title || 'CoW DAO Article',
      text: content.split(' ').slice(0, 50).join(' ') + '...',
      url: window.location.href,
    })
  }

  return (
    <Layout
      metaTitle={`${title} - ${siteConfigData.title}`}
      metaDescription={plainContent.split(' ').slice(0, 50).join(' ') + '...'}
      ogImage={coverImageUrl}
    >
      <Wrapper>
        <CategoryLinks>
          <li>
            <a href="/learn" onClick={() => clickOnKnowledgeBase('click-knowledge-base')}>
              Knowledge Base
            </a>
          </li>
          {allCategories.map((category: { name: string; slug: string }) => (
            <li key={category.slug}>
              <a
                href={`/learn/topic/${category.slug}`}
                onClick={() => clickOnKnowledgeBase(`click-topic-${category.name}`)}
              >
                {category.name}
              </a>
            </li>
          ))}
        </CategoryLinks>

        <SearchBar articles={articles} />
        <ContainerCard gap={62} gapMobile={42} margin="0 auto" centerContent>
          <ArticleContent>
            <Breadcrumbs>
              <a href="/" onClick={() => clickOnKnowledgeBase('click-breadcrumbs-home')}>
                Home
              </a>
              <a href="/learn" onClick={() => clickOnKnowledgeBase('click-breadcrumbs-knowledge-base')}>
                Knowledge Base
              </a>
              <span>{title}</span>
            </Breadcrumbs>

            {categories && Array.isArray(categories.data) && categories.data.length > 0 && (
              <CategoryTags>
                {categories.data.map((category: { id: string; attributes?: { slug?: string; name?: string } }) => (
                  <a
                    key={category.id}
                    href={`/learn/topic/${category.attributes?.slug ?? ''}`}
                    onClick={() => clickOnKnowledgeBase(`click-category-${category.attributes?.name}`)}
                  >
                    {category.attributes?.name ?? ''}
                  </a>
                ))}
              </CategoryTags>
            )}

            <ArticleMainTitle>{title}</ArticleMainTitle>

            <ArticleSubtitle
              dateIso={(publishDate || publishedAt)!}
              dateVisible={publishDateVisible}
              content={content}
            />
            <BodyContent>
              {blocks &&
                blocks.map((block: SharedRichTextComponent) =>
                  isRichTextComponent(block) ? (
                    <ArticleSharedRichTextComponent key={block.id} sharedRichText={block} />
                  ) : null
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
                {featuredArticles.map((article) => (
                  <li key={article.id}>
                    <a
                      href={`/learn/${article.attributes?.slug}`}
                      onClick={() => clickOnKnowledgeBase(`click-related-article-${article.attributes?.title}`)}
                    >
                      {article.attributes?.title}
                    </a>
                  </li>
                ))}
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
                const coverData = article.attributes?.cover?.data
                const imageUrl = coverData?.attributes?.url

                return (
                  <ArticleCard
                    key={article.id}
                    href={`/learn/${article.attributes?.slug}`}
                    onClick={() => clickOnKnowledgeBase(`click-read-more-${article.attributes?.title}`)}
                  >
                    {imageUrl && (
                      <ArticleImage>
                        <CmsImage src={imageUrl} alt={article.attributes?.title ?? 'Article Image'} />
                      </ArticleImage>
                    )}
                    <ArticleTitle>{article.attributes?.title}</ArticleTitle>
                  </ArticleCard>
                )
              })}
            </ArticleList>
          </ContainerCardSection>
        </ContainerCard>
      </Wrapper>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<ArticlePageProps> = async ({ params }) => {
  const siteConfigData = CONFIG
  const articleSlug = params?.article as string
  const article = await getArticleBySlug(articleSlug)

  if (!article) {
    return { notFound: true }
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

  return {
    props: {
      siteConfigData,
      article,
      articles,
      randomArticles,
      featuredArticles,
      allCategories,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await getAllArticleSlugs()
  const paths = slugs.map((slug) => ({ params: { article: slug } }))

  return { paths, fallback: 'blocking' }
}
