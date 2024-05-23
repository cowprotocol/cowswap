import React from 'react'
import Head from 'next/head'
import { GetStaticPaths, GetStaticProps } from 'next'
import styled from 'styled-components'
import { Font, Color, Media } from '@cowprotocol/ui'
import { CONFIG } from '@/const/meta'
import LayoutV2 from '@/components/Layout/LayoutV2'
import { getArticles, getArticleBySlug, getAllArticleSlugs, Article, SharedRichTextComponent } from 'services/cms'
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
} from './styled'

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
  gap: 24px;
  max-width: 1600px;

  ${Media.upToMedium()} {
    margin: 0 auto;
    gap: 0;
  }
`

const ArticleContent = styled.div`
  --maxWidth: 725px;
  width: 100%;
  max-width: var(--maxWidth);
  flex: 3;
  padding: 0;
  border-radius: 20px;
`

const StickyMenu = styled.div`
  --maxWidth: 344px;
  width: 100%;
  max-width: var(--maxWidth);
  height: min-content;
  min-height: 240px;
  flex: 1;
  position: sticky;
  top: 100px;
  background: ${Color.neutral100};
  color: ${Color.neutral0};
  padding: 30px 24px;
  border-radius: 32px;

  ${Media.upToMedium()} {
    --maxWidth: 100%;
  }

  > b {
    display: block;
    font-size: 18px;
    font-weight: ${Font.weight.bold};
    color: ${Color.neutral10};
    margin: 0 0 24px;
  }
`

const Title = styled.h1`
  font-size: 67px;
  font-weight: ${Font.weight.bold};
  color: ${Color.neutral10};
  margin-bottom: 16px;

  ${Media.upToMedium()} {
    font-size: 37px;
  }
`

const BodyContent = styled.div`
  font-size: 18px;
  line-height: 1.6;
  color: ${Color.neutral0};

  img {
    max-width: 100%;
    border-radius: 10px;
    margin-top: 20px;
  }

  a {
    color: ${Color.neutral20};
    text-decoration: underline;
    transition: color 0.2s ease-in-out;

    &:hover {
      color: ${Color.neutral40};
    }
  }

  > p,
  > ul,
  > ol {
    margin-bottom: 16px;
    font-size: 21px;
    line-height: 1.4;

    ${Media.upToMedium()} {
      font-size: 18px;
    }
  }

  > ul,
  > ol {
    padding-left: 20px;

    > li {
      margin: 0 0 24px;
      font-size: inherit;
    }
  }

  > blockquote {
    margin: 24px 0;
    padding: 8px 24px;
    background: ${Color.neutral90};
    border-left: 4px solid ${Color.neutral20};
    color: ${Color.neutral20};
    font-style: italic;
    font-size: inherit;

    > p {
      line-height: 1.6;
    }
  }

  > h2,
  > h3,
  > h4,
  > h5,
  > h6 {
    font-weight: bold;
    margin: 56px 0 32px;
  }

  > h2 {
    font-size: 38px;

    ${Media.upToMedium()} {
      font-size: 24px;
    }
  }

  > h3 {
    font-size: 32px;

    ${Media.upToMedium()} {
      font-size: 22px;
    }
  }

  > h4 {
    font-size: 28px;

    ${Media.upToMedium()} {
      font-size: 20px;
    }
  }

  > h5 {
    font-size: 24px;

    ${Media.upToMedium()} {
      font-size: 18px;
    }
  }

  > h6 {
    font-size: 20px;

    ${Media.upToMedium()} {
      font-size: 16px;
    }
  }
`

const RelatedArticles = styled.div`
  font-size: 18px;
  color: ${Color.neutral0};

  > ul {
    list-style: disc;
    padding: 0 0 0 20px;

    > li {
      margin: 0 0 16px;
      color: inherit;
    }

    > li > a {
      color: inherit;
      text-decoration: none;
      line-height: 1.2;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`

const ArticleSubtitleWrapper = styled.div`
  color: ${Color.neutral40};
  font-weight: ${Font.weight.bold};
  font-size: 16px;
  display: flex;
  flex-flow: row wrap;
  gap: 10px;
  margin: 34px 0;

  > div span {
    font-weight: normal;
  }
`

const CategoryTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 16px;
  color: ${Color.neutral10};
  font-weight: ${Font.weight.medium};

  a {
    display: inline-block;
    padding: 8px 12px;
    background: ${Color.neutral98};
    border-radius: 16px;
    text-decoration: none;
    transition: background 0.2s ease-in-out, color 0.2s ease-in-out;
    color: inherit;
    font-weight: inherit;
    font-size: inherit;

    &:hover {
      background: ${Color.neutral10};
      color: ${Color.neutral98};
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
}: ArticlePageProps & { randomArticles: Article[]; relatedArticles: Article[] }) {
  const { title, blocks, publishedAt, categories } = article.attributes || {}
  const content = blocks?.map((block) => (isRichTextComponent(block) ? block.body : '')).join(' ') || ''

  return (
    <LayoutV2>
      <Head>
        <title>
          {title} - {siteConfigData.title}
        </title>
      </Head>

      <Wrapper>
        <SearchBar articles={articles} />
        <ContainerCard gap={62} gapMobile={42} centerContent>
          <ArticleContent>
            <Breadcrumbs>
              <a href="/v2/learn">Learn</a>
              <span>{title}</span>
            </Breadcrumbs>

            {categories && Array.isArray(categories.data) && categories.data.length > 0 && (
              <CategoryTags>
                {categories.data.map((category) => (
                  <a key={category.id} href={`/v2/learn/topic/${category.attributes?.slug ?? ''}`}>
                    {category.attributes?.name ?? ''}
                  </a>
                ))}
              </CategoryTags>
            )}

            <Title>{title}</Title>

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
                    <a href={`/article/${article.attributes?.slug}`}>{article.attributes?.title}</a>
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
              <h3>Read more</h3>
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
    </LayoutV2>
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

  return {
    props: {
      siteConfigData,
      article,
      articles,
      randomArticles,
      relatedArticles,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await getAllArticleSlugs()
  const paths = slugs.map((slug) => ({ params: { article: slug } }))

  return { paths, fallback: false }
}
