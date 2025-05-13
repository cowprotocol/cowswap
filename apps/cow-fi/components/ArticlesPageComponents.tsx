'use client'

import { CategoryLinks } from '@/components/CategoryLinks'
import { SearchBar } from '@/components/SearchBar'
import {
  ArticleCount,
  Breadcrumbs,
  ContainerCard,
  ContainerCardInner,
  ContainerCardSection,
  ContainerCardSectionTop,
  LinkSection,
  Pagination,
} from '@/styles/styled'
import { CowFiCategory } from 'src/common/analytics/types'
import { ArticlesList } from '@/components/ArticlesList'
import { Article } from '../services/cms'
import styled from 'styled-components/macro'
import { Color, Font, Media } from '@cowprotocol/ui'
import Link from 'next/link'
import { useCowAnalytics } from '@cowprotocol/analytics'
import { calculateTotalPages, calculatePageRange, createPaginationArray } from '@/util/paginationUtils'

const LEARN_PATH = '/learn'
const ARTICLES_PATH = `${LEARN_PATH}/articles`

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
  articles: Article[]
  totalArticles: number
  currentPage: number
  allCategories: { name: string; slug: string }[]
  allArticles: Article[]
}

export function ArticlesPageComponents({
  articles,
  totalArticles,
  currentPage,
  allCategories,
  allArticles,
}: ArticlesPageProps) {
  const analytics = useCowAnalytics()
  const totalPages = calculateTotalPages(totalArticles)
  const { start, end } = calculatePageRange(currentPage, totalArticles)

  return (
    <Wrapper>
      <CategoryLinks allCategories={allCategories} />
      <SearchBar />
      <ContainerCard gap={42} gapMobile={24} touchFooter>
        <ContainerCardInner maxWidth={970} gap={24} gapMobile={24}>
          <ContainerCardSectionTop>
            <Breadcrumbs padding="0">
              <Link
                href={LEARN_PATH}
                onClick={() =>
                  analytics.sendEvent({
                    category: CowFiCategory.KNOWLEDGEBASE,
                    action: 'Click breadcrumb',
                    label: 'home',
                  })
                }
              >
                Knowledge Base
              </Link>
              <h1>All articles</h1>
            </Breadcrumbs>
            <ArticleCount>
              Showing {start}-{end} of {totalArticles} articles
            </ArticleCount>
          </ContainerCardSectionTop>
          <ContainerCardSection>
            <LinkSection bgColor={'transparent'} columns={1} padding="0">
              <ArticlesList articles={articles} />
            </LinkSection>
          </ContainerCardSection>
          <Pagination>
            {createPaginationArray(totalPages).map((pageNum) => (
              <Link
                key={pageNum - 1}
                href={pageNum === 1 ? ARTICLES_PATH : `${ARTICLES_PATH}/${pageNum}`}
                className={pageNum === currentPage ? 'active' : ''}
                onClick={() =>
                  analytics.sendEvent({
                    category: CowFiCategory.KNOWLEDGEBASE,
                    action: 'Click pagination',
                    label: `page-${pageNum}`,
                  })
                }
              >
                {pageNum}
              </Link>
            ))}
          </Pagination>
        </ContainerCardInner>
      </ContainerCard>
    </Wrapper>
  )
}
