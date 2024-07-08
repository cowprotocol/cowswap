import React from 'react'
import { GetStaticPaths, GetStaticProps } from 'next'
import styled from 'styled-components/macro'
import { Font, Color, Media } from '@cowprotocol/ui'
import Layout from '@/components/Layout'
import { getCategoryBySlug, getAllCategorySlugs, getArticles, getCategories } from 'services/cms'
import { SearchBar } from '@/components/SearchBar'
import { ArrowButton } from '@/components/ArrowButton'

import {
  Breadcrumbs,
  ContainerCard,
  ContainerCardSection,
  ContainerCardInner,
  ContainerCardSectionTop,
  LinkSection,
  LinkColumn,
  LinkItem,
  CategoryLinks,
} from '@/styles/styled'
import { clickOnKnowledgeBase } from 'modules/analytics'
import { CmsImage } from '@cowprotocol/ui'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 1760px;
  width: 100%;
  margin: 24px auto 0;
  gap: 34px;
  padding: 0 16px;

  ${Media.upToMedium()} {
    margin: 0 auto;
    gap: 24px;
  }
`

const CategoryTitle = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: 24px;
  font-size: 52px;

  ${Media.upToMedium()} {
    font-size: 32px;
  }

  > h1 {
    font-size: inherit;
  }
`

const CategoryImageWrapper = styled.div`
  --size: 82px;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  display: flex;
  justify-content: center;
`

const CategoryImage = styled(CmsImage)`
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
  category: any
  articles: any[]
  allCategories: { name: string; slug: string }[]
}

export default function TopicPage({ category, articles, allCategories }: TopicPageProps) {
  const { name, description, image } = category.attributes || {}
  const imageUrl = image?.data?.attributes?.url

  return (
    <Layout metaTitle={`${name} - Knowledge Base`} metaDescription={description}>
      <Wrapper>
        <CategoryLinks>
          <li>
            <a href="/learn" onClick={() => clickOnKnowledgeBase('click-categories-home')}>
              Knowledge Base
            </a>
          </li>
          {allCategories.map((category) => (
            <li key={category.slug}>
              <a
                href={`/learn/topic/${category.slug}`}
                onClick={() => clickOnKnowledgeBase(`click-categories-${category.name}`)}
              >
                {category.name}
              </a>
            </li>
          ))}
        </CategoryLinks>

        <SearchBar articles={articles} />

        <ContainerCard gap={42} gapMobile={24} minHeight="100vh" alignContent="flex-start" touchFooter>
          <ContainerCardInner maxWidth={970} gap={24} gapMobile={24}>
            <Breadcrumbs padding={'0'}>
              <a href="/" onClick={() => clickOnKnowledgeBase('click-breadcrumbs-home')}>
                Home
              </a>
              <a href="/learn" onClick={() => clickOnKnowledgeBase('click-breadcrumbs-knowledgebase')}>
                Knowledge Base
              </a>
              <a href="/learn/topics/" onClick={() => clickOnKnowledgeBase('click-breadcrumbs-topics')}>
                Topic
              </a>
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
              <ArrowButton link="/learn/topics" text="All topics" />
            </ContainerCardSectionTop>

            <ContainerCardSection>
              <CategoryDescription>
                <p>{description}</p>
                <i>{articles.length} articles</i>
              </CategoryDescription>

              <LinkSection bgColor={'transparent'} columns={1} padding="0">
                <LinkColumn>
                  {articles?.map((article) =>
                    article.attributes ? (
                      <LinkItem
                        key={article.id}
                        href={`/learn/${article.attributes.slug}`}
                        onClick={() => clickOnKnowledgeBase(`click-article-${article.attributes.title}`)}
                      >
                        {article.attributes.title}
                        <span>→</span>
                      </LinkItem>
                    ) : null
                  )}
                </LinkColumn>
              </LinkSection>
            </ContainerCardSection>
          </ContainerCardInner>
        </ContainerCard>
      </Wrapper>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.topicSlug as string
  const category = await getCategoryBySlug(slug)

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

  const categoriesResponse = await getCategories()
  const allCategories =
    categoriesResponse?.map((category: any) => ({
      name: category?.attributes?.name || '',
      slug: category?.attributes?.slug || '',
    })) || []

  return {
    props: {
      category,
      articles,
      allCategories,
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
