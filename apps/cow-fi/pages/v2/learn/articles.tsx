import Head from 'next/head'
import { GetStaticProps } from 'next'
import styled from 'styled-components'
import { Font, Color, Media } from '@cowprotocol/ui'
import { CONFIG } from '@/const/meta'
import LayoutV2 from '@/components/Layout/LayoutV2'
import { getArticles, Article } from 'services/cms'
import { SearchBar } from '@/components/SearchBar'

import {
  ContainerCard,
  ContainerCardSection,
  ArticleList,
  ArticleCard,
  ArticleImage,
  ArticleTitle,
  ArticleDescription,
  ContainerCardSectionTop,
  Breadcrumbs,
  ArticleCount,
  Pagination,
} from '../styled'

const LEARN_PATH = '/v2/learn/'

const DATA_CACHE_TIME_SECONDS = 5 * 60 // Cache 5min
const ITEMS_PER_PAGE = 24

interface ArticlesPageProps {
  siteConfigData: typeof CONFIG
  articles: Article[]
  totalArticles: number
  currentPage: number
}

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

export default function ArticlesPage({ siteConfigData, articles, totalArticles, currentPage }: ArticlesPageProps) {
  const totalPages = Math.ceil(totalArticles / ITEMS_PER_PAGE)

  return (
    <LayoutV2>
      <Head>
        <title>{siteConfigData.title} - All Articles</title>
      </Head>

      <Wrapper>
        <SearchBar articles={articles} />

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
            <ArticleList>
              {articles.map((article) => (
                <ArticleCard key={article.id} href={`${LEARN_PATH}${article.attributes?.slug}`}>
                  <ArticleImage></ArticleImage> {/* Remove color prop here */}
                  <ArticleTitle>{article.attributes?.title}</ArticleTitle>
                  <ArticleDescription>{article.attributes?.description}</ArticleDescription>
                </ArticleCard>
              ))}
            </ArticleList>
          </ContainerCardSection>

          <Pagination>
            {Array.from({ length: totalPages }, (_, i) => (
              <a key={i} href={`?page=${i + 1}`} className={i + 1 === currentPage ? 'active' : ''}>
                {i + 1}
              </a>
            ))}
          </Pagination>
        </ContainerCard>
      </Wrapper>
    </LayoutV2>
  )
}

export const getStaticProps: GetStaticProps<ArticlesPageProps> = async (context) => {
  const siteConfigData = CONFIG
  const page = parseInt((context.params?.page as string) || '1', 10)
  const articlesResponse = await getArticles({ page, pageSize: ITEMS_PER_PAGE })

  // Extract data and meta from articlesResponse
  const totalArticles = articlesResponse.meta?.pagination?.total || 0
  const articles = articlesResponse.data || []

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
