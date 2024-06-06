import React from 'react'
import Head from 'next/head'
import { GetStaticPaths, GetStaticProps } from 'next'
import styled from 'styled-components'
import { Color, Media } from '@cowprotocol/ui'
import { CONFIG } from '@/const/meta'
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
import { formatDate } from 'util/formatDate'
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
  StickyMenu,
  RelatedArticles,
} from '@/styles/styled'

const DATA_CACHE_TIME_SECONDS = 5 * 60 // Cache 5min

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
  max-width: 1600px;

  ${Media.upToMedium()} {
    margin: 0 auto;
    gap: 24px;
  }
`

const CategoryLinks = styled.ul`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 0;
  margin: 0;
  list-style: none;
  font-size: 16px;
  font-weight: 500;
  color: ${Color.neutral50};
  width: 100%;

  ${Media.upToMedium()} {
    overflow-x: auto;
    flex-flow: row nowrap;
    justify-content: flex-start;
    gap: 24px;
    padding: 16px 34px 0 16px;
  }

  li {
    display: inline-block;
  }

  a {
    color: ${Color.neutral50};
    text-decoration: none;
    transition: color 0.2s ease-in-out;
    white-space: nowrap;
    line-height: 1;

    &:hover {
      color: ${Color.neutral0};
    }
  }
`

export function ArticleSubtitle({ dateIso, content }: { dateIso: string; content: string }) {
  const date = new Date(dateIso)
  const readTime = calculateReadTime(content)

  return (
    <ArticleSubtitleWrapper>
      <div>
        <span>{readTime}</span>
      </div>
      <div>·</div>
      <div>
        <span>Published {formatDate(date)}</span>
      </div>
    </ArticleSubtitleWrapper>
  )
}

export function ArticleSharedRichTextComponent({ sharedRichText }: { sharedRichText: SharedRichTextComponent }) {
  return <ReactMarkdown>{sharedRichText.body}</ReactMarkdown>
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
  relatedArticles,
  allCategories, // Renamed to avoid duplication
}: ArticlePageProps & {
  randomArticles: Article[]
  relatedArticles: Article[]
  allCategories: { name: string; slug: string }[] // Ensure type matches fetched data
}) {
  const { title, blocks, publishedAt, categories } = article.attributes || {}
  const content = blocks?.map((block) => (isRichTextComponent(block) ? block.body : '')).join(' ') || ''

  return (
    <Layout>
      <Head>
        <title>
          {title} - {siteConfigData.title}
        </title>
      </Head>

      <Wrapper>
        <CategoryLinks>
          <li>
            <a href="/learn">All Topics</a>
          </li>
          {allCategories.map((category) => (
            <li key={category.slug}>
              <a href={`/learn/topic/${category.slug}`}>{category.name}</a>
            </li>
          ))}
        </CategoryLinks>

        <SearchBar articles={articles} />
        <ContainerCard gap={62} gapMobile={42} margin="0 auto" centerContent>
          <ArticleContent>
            <Breadcrumbs>
              <a href="/">Home</a>
              <a href="/learn">Learn</a>
              <span>{title}</span>
            </Breadcrumbs>

            {categories && Array.isArray(categories.data) && categories.data.length > 0 && (
              <CategoryTags>
                {categories.data.map((category) => (
                  <a key={category.id} href={`/learn/topic/${category.attributes?.slug ?? ''}`}>
                    {category.attributes?.name ?? ''}
                  </a>
                ))}
              </CategoryTags>
            )}

            <ArticleMainTitle>{title}</ArticleMainTitle>

            <ArticleSubtitle dateIso={publishedAt!} content={content} />
            <BodyContent>
              {blocks &&
                blocks.map((block) =>
                  isRichTextComponent(block) ? (
                    <ArticleSharedRichTextComponent key={block.id} sharedRichText={block} />
                  ) : null
                )}
            </BodyContent>
          </ArticleContent>

          <StickyMenu>
            <b>Related Articles</b>
            <RelatedArticles>
              <ul>
                {relatedArticles.map((article) => (
                  <li key={article.id}>
                    <a href={`/learn/${article.attributes?.slug}`}>{article.attributes?.title}</a>
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
                  <ArticleCard key={article.id} href={`/article/${article.attributes?.slug}`}>
                    {imageUrl && (
                      <ArticleImage>
                        <img src={imageUrl} alt={article.attributes?.title ?? 'Article Image'} />
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
  const randomArticles = getRandomArticles(articles, 3)
  const relatedArticles = getRandomArticles(articles, 7)
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
      relatedArticles,
      allCategories,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await getAllArticleSlugs()
  const paths = slugs.map((slug) => ({ params: { article: slug } }))

  return { paths, fallback: false }
}
