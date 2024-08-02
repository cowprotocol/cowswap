import { GetStaticProps, GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import styled from 'styled-components/macro'
import { Font, Color, Media } from '@cowprotocol/ui'

import Layout from '@/components/Layout'
import { getArticles, getCategories, Article } from 'services/cms'
import { SearchBar } from '@/components/SearchBar'

import {
  ContainerCard,
  ContainerCardSection,
  ContainerCardSectionTop,
  Breadcrumbs,
  ArticleCount,
  Pagination,
  LinkSection,
  LinkColumn,
  LinkItem,
  ContainerCardInner,
  CategoryLinks,
} from '@/styles/styled'

const LEARN_PATH = '/learn/'
const ARTICLES_PATH = `${LEARN_PATH}articles/`

import { CONFIG, DATA_CACHE_TIME_SECONDS } from '@/const/meta'
import { clickOnKnowledgeBase } from 'modules/analytics'
const ITEMS_PER_PAGE = 24

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 24px auto 0;
  gap: 34px;
  max-width: 1760px;

  > h1 {
    font-size: 28px;
    font-weight: ${Font.weight.medium};
    color: ${Color.neutral50};
    text-align: center;

    ${Media.upToMedium()} {
      font-size: 18px;
    }
  }

  > h2 {
    font-size: 67px;
    text-align: center;

    ${Media.upToMedium()} {
      font-size: 38px;
    }
  }
`

interface ArticlesPageProps {
  siteConfigData: typeof CONFIG
  articles?: any[]
  totalArticles?: number
  currentPage?: number
  allCategories: { name: string; slug: string }[]
}

export type ArticlesResponse = {
  data?: Article[]
  meta?: {
    pagination?: {
      total?: number
    }
  }
}

export default function ArticlesPage({
  articles,
  totalArticles = 0,
  currentPage = 1,
  allCategories,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const totalPages = articles ? Math.ceil(totalArticles / ITEMS_PER_PAGE) : 0

  return (
    <Layout
      metaTitle={`All articles ${currentPage === 1 ? '' : `(${currentPage})`} - Knowledge Base`}
      metaDescription="All knowledge base articles in the Cow DAO ecosystem"
    >
      <Wrapper>
        <CategoryLinks>
          <li>
            <a href="/learn" onClick={() => clickOnKnowledgeBase('click-categories-home')}>
              Knowledge Base
            </a>
          </li>
          {(allCategories || []).map((category) => (
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

        <SearchBar articles={articles || []} />

        <ContainerCard gap={42} gapMobile={24} touchFooter>
          <ContainerCardInner maxWidth={970} gap={24} gapMobile={24}>
            <ContainerCardSectionTop>
              <Breadcrumbs padding={'0'}>
                <a href="/learn" onClick={() => clickOnKnowledgeBase('click-breadcrumbs-home')}>
                  Knowledge Base
                </a>
                <h1>All articles</h1>
              </Breadcrumbs>

              <ArticleCount>
                Showing {ITEMS_PER_PAGE * (currentPage - 1) + 1}-{Math.min(ITEMS_PER_PAGE * currentPage, totalArticles)}{' '}
                of {totalArticles} articles
              </ArticleCount>
            </ContainerCardSectionTop>

            <ContainerCardSection>
              <LinkSection bgColor={'transparent'} columns={1} padding="0">
                <LinkColumn>
                  {articles?.map((article) =>
                    article.attributes ? (
                      <LinkItem
                        key={article.id}
                        href={`${LEARN_PATH}${article.attributes.slug}`}
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

            <Pagination>
              {Array.from({ length: totalPages }, (_, i) => (
                <a
                  key={i}
                  href={`${ARTICLES_PATH}${i + 1}`}
                  className={i + 1 === currentPage ? 'active' : ''}
                  onClick={() => clickOnKnowledgeBase(`click-pagination-${i + 1}`)}
                >
                  {i + 1}
                </a>
              ))}
            </Pagination>
          </ContainerCardInner>
        </ContainerCard>
      </Wrapper>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<ArticlesPageProps> = async (context: GetStaticPropsContext) => {
  const siteConfigData = CONFIG
  const pageParam = context.params?.page as string[] | undefined
  const page = pageParam && pageParam.length > 0 ? parseInt(pageParam[0], 10) : 1

  const articlesResponse = (await getArticles({ page, pageSize: ITEMS_PER_PAGE })) as ArticlesResponse

  const totalArticles = articlesResponse.meta?.pagination?.total || 0
  const articles =
    articlesResponse.data?.map((article: Article) => ({
      ...article,
      id: article.id || 0,
      attributes: {
        ...article.attributes,
        cover: article.attributes?.cover ?? {},
        blocks: article.attributes?.blocks ?? [],
      },
    })) || []

  const categoriesResponse = await getCategories()
  const allCategories =
    categoriesResponse?.map((category: any) => ({
      name: category?.attributes?.name || '',
      slug: category?.attributes?.slug || '',
    })) || []

  return {
    props: {
      siteConfigData,
      articles,
      totalArticles,
      currentPage: page,
      allCategories,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const articlesResponse = await getArticles({ page: 0, pageSize: ITEMS_PER_PAGE })
  const totalArticles = articlesResponse.meta?.pagination?.total || 0
  const totalPages = Math.ceil(totalArticles / ITEMS_PER_PAGE)

  const paths = [
    { params: { page: [] } }, // Root path should be page 1
    ...Array.from({ length: totalPages }, (_, i) => ({
      params: { page: [(i + 1).toString()] },
    })),
  ]

  return {
    paths,
    fallback: 'blocking',
  }
}
