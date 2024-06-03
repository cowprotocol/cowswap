import Head from 'next/head'
import { GetStaticProps, GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import styled from 'styled-components'
import { Font, Color, Media } from '@cowprotocol/ui'
import { CONFIG } from '@/const/meta'
import LayoutV2 from '@/components/Layout/LayoutV2'
import { getArticles, Article } from 'services/cms'
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
} from '@/styles/styled'

const LEARN_PATH = '/learn/'

const DATA_CACHE_TIME_SECONDS = 5 * 60 // Cache 5min
const ITEMS_PER_PAGE = 24

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  max-width: 1600px;
  width: 100%;
  margin: 32px auto 0;
  gap: 24px;

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
  siteConfigData,
  articles,
  totalArticles = 0,
  currentPage = 1,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const totalPages = articles ? Math.ceil(totalArticles / ITEMS_PER_PAGE) : 0

  return (
    <LayoutV2>
      <Head>
        <title>{siteConfigData.title} - All Articles</title>
      </Head>

      <Wrapper>
        <SearchBar articles={articles || []} />

        <ContainerCard gap={42} gapMobile={24}>
          <ContainerCardSectionTop>
            <Breadcrumbs padding={'0'}>
              <a href="/Learn">Learn</a>
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
                    <LinkItem key={article.id} href={`${LEARN_PATH}${article.attributes.slug}`}>
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
              <a key={i} href={`${LEARN_PATH}${i + 1}`} className={i + 1 === currentPage ? 'active' : ''}>
                {i + 1}
              </a>
            ))}
          </Pagination>
        </ContainerCard>
      </Wrapper>
    </LayoutV2>
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
      id: article.id || 0, // Ensure id is a number
      attributes: {
        ...article.attributes,
        cover: article.attributes?.cover ?? {},
        blocks: article.attributes?.blocks ?? [],
      },
    })) || []

  return {
    props: {
      siteConfigData,
      articles,
      totalArticles,
      currentPage: page,
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
