import React from 'react'
import Head from 'next/head'
import { GetStaticPaths, GetStaticProps } from 'next'
import styled from 'styled-components'
import { Font, Color, Media } from '@cowprotocol/ui'
import LayoutV2 from '@/components/Layout/LayoutV2'
import { getCategoryBySlug, getAllCategorySlugs, getArticles } from 'services/cms'
import { SearchBar } from '@/components/SearchBar'
import { ArrowButton } from '@/components/ArrowButton'

import {
  Breadcrumbs,
  ContainerCard,
  ContainerCardSection,
  ContainerCardSectionTop,
  ArticleList,
  ArticleCard,
  ArticleImage,
  ArticleTitle,
  ArticleDescription,
} from '@/styles/styled'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 1600px;
  width: 100%;
  margin: 76px auto 0;
  gap: 24px;
  padding: 0 16px;

  ${Media.upToMedium()} {
    margin: 0 auto;
    gap: 0;
    padding: 0 8px;
  }
`

const CategoryTitle = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: 24px;
  font-size: 32px;
`

const CategoryImageWrapper = styled.div`
  --size: 82px;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  display: flex;
  justify-content: center;
`

const CategoryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
`

const CategoryDescription = styled.div`
  font-size: 21px;
  line-height: 1.5;
  color: ${Color.neutral20};
  display: flex;
  flex-flow: column wrap;
  gap: 24px;

  > p {
    margin: 0;
    font-size: inherit;
    line-height: inherit;
    color: inherit;
  }

  > i {
    font-size: 16px;
    font-weight: ${Font.weight.bold};
    color: ${Color.neutral0};
    font-style: normal;
  }
`

interface TopicPageProps {
  category: any // Adjust the type as per your Category structure
  articles: any[] // Adjust the type as per your Article structure
}

export default function TopicPage({ category, articles }: TopicPageProps) {
  const { name, description, image } = category.attributes || {}
  const imageUrl = image?.data?.attributes?.url

  return (
    <LayoutV2>
      <Head>
        <title>{name} - Knowledge Base</title>
        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:title" content={name} />
        <meta name="twitter:title" content={name} />
      </Head>

      <Wrapper>
        <SearchBar articles={articles} />

        <ContainerCard gap={42} gapMobile={24} touchFooter>
          <Breadcrumbs padding={'0'}>
            <a href="/v2/topics/">Topic</a>
            <span>{name}</span>
          </Breadcrumbs>

          <ContainerCardSectionTop>
            <CategoryTitle>
              {imageUrl && (
                <CategoryImageWrapper>
                  <CategoryImage src={imageUrl} alt={name} />
                </CategoryImageWrapper>
              )}
              <h1>{name}</h1>
            </CategoryTitle>
            <ArrowButton link="/v2/learn/topics" text="All topics" />
          </ContainerCardSectionTop>

          <ContainerCardSection>
            <CategoryDescription>
              <p>{description}</p>
              <i>{articles.length} articles</i>
            </CategoryDescription>

            <ArticleList columns={4} columnsMobile={2}>
              {articles.map((article) => {
                const coverData = article.attributes?.cover?.data
                const imageUrl = coverData?.attributes?.url

                return (
                  <ArticleCard
                    key={article.id}
                    href={`/v2/learn/${article.attributes?.slug}`}
                    target="_self"
                    rel="noopener"
                  >
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

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.topicSlug as string
  const categoryResponse = await getCategoryBySlug(slug)
  const category = categoryResponse

  if (!category) {
    return {
      notFound: true,
    }
  }

  const articlesResponse = await getArticles({
    page: 0,
    pageSize: 50,
    filters: {
      categories: {
        slug: {
          $eq: slug,
        },
      },
    },
  })

  const articles = articlesResponse.data

  return {
    props: {
      category,
      articles,
    },
    revalidate: 5 * 60,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const categoriesResponse = await getAllCategorySlugs()
  const paths = categoriesResponse.map((slug) => ({
    params: { topicSlug: slug },
  }))

  return {
    paths,
    fallback: false,
  }
}
