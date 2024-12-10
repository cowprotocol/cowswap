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
import { clickOnKnowledgeBase } from '../modules/analytics'
import { ArticlesList } from '@/components/ArticlesList'
import { Article } from '../services/cms'
import styled from 'styled-components/macro'
import { Color, Font, Media } from '@cowprotocol/ui'
import Link from 'next/link'

const LEARN_PATH = '/learn/'
const ARTICLES_PATH = `${LEARN_PATH}articles/`

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
  articles: Article[]
  totalArticles: number
  currentPage: number
  allCategories: { name: string; slug: string }[]
}

export function ArticlesPageComponents({ articles, totalArticles, currentPage, allCategories }: ArticlesPageProps) {
  const totalPages = Math.ceil(totalArticles / ITEMS_PER_PAGE)

  return (
    <Wrapper>
      <CategoryLinks allCategories={allCategories} />
      <SearchBar articles={articles} />
      <ContainerCard gap={42} gapMobile={24} touchFooter>
        <ContainerCardInner maxWidth={970} gap={24} gapMobile={24}>
          <ContainerCardSectionTop>
            <Breadcrumbs padding="0">
              <Link href="/learn" onClick={() => clickOnKnowledgeBase('click-breadcrumbs-home')}>
                Knowledge Base
              </Link>
              <h1>All articles</h1>
            </Breadcrumbs>
            <ArticleCount>
              Showing {ITEMS_PER_PAGE * (currentPage - 1) + 1}-{Math.min(ITEMS_PER_PAGE * currentPage, totalArticles)}{' '}
              of {totalArticles} articles
            </ArticleCount>
          </ContainerCardSectionTop>
          <ContainerCardSection>
            <LinkSection bgColor={'transparent'} columns={1} padding="0">
              <ArticlesList articles={articles} />
            </LinkSection>
          </ContainerCardSection>
          <Pagination>
            {Array.from({ length: totalPages }, (_, i) => (
              <Link
                key={i}
                href={`${ARTICLES_PATH}${i + 1}`}
                className={i + 1 === currentPage ? 'active' : ''}
                onClick={() => clickOnKnowledgeBase(`click-pagination-${i + 1}`)}
              >
                {i + 1}
              </Link>
            ))}
          </Pagination>
        </ContainerCardInner>
      </ContainerCard>
    </Wrapper>
  )
}
