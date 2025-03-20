'use client'

import styled from 'styled-components/macro'
import { CmsImage, Color, Font, Media } from '@cowprotocol/ui'
import { useCowAnalytics } from '@cowprotocol/analytics'
import { CowFiCategory } from 'src/common/analytics/types'
import { CategoryLinks } from '@/components/CategoryLinks'
import { SearchBar } from '@/components/SearchBar'
import { ArrowButton } from '@/components/ArrowButton'
import {
  Breadcrumbs,
  ContainerCard,
  ContainerCardInner,
  ContainerCardSection,
  ContainerCardSectionTop,
  LinkColumn,
  LinkItem,
  LinkSection,
} from '@/styles/styled'
import Link from 'next/link'
import { Article } from '../services/cms'

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
  articles: Article[]
  allCategories: { name: string; slug: string }[]
  allArticles: Article[]
}

export function TopicPageComponent({ category, allCategories, articles, allArticles }: TopicPageProps) {
  const analytics = useCowAnalytics()

  return (
    <Wrapper>
      <CategoryLinks allCategories={allCategories} />

      <SearchBar />

      <ContainerCard gap={42} gapMobile={24} minHeight="100vh" alignContent="flex-start" touchFooter>
        <ContainerCardInner maxWidth={970} gap={24} gapMobile={24}>
          <Breadcrumbs padding={'0'}>
            <Link
              href="/"
              onClick={() =>
                analytics.sendEvent({
                  category: CowFiCategory.KNOWLEDGEBASE,
                  action: 'Click breadcrumb',
                  label: 'home',
                })
              }
            >
              Home
            </Link>
            <Link
              href="/learn"
              onClick={() =>
                analytics.sendEvent({
                  category: CowFiCategory.KNOWLEDGEBASE,
                  action: 'Click breadcrumb',
                  label: 'knowledge-base',
                })
              }
            >
              Knowledge Base
            </Link>
            <Link
              href="/learn/topics"
              onClick={() =>
                analytics.sendEvent({
                  category: CowFiCategory.KNOWLEDGEBASE,
                  action: 'Click breadcrumb',
                  label: 'topics',
                })
              }
            >
              Topic
            </Link>
            <span>{category.name}</span>
          </Breadcrumbs>

          <ContainerCardSectionTop>
            <CategoryTitle>
              {category.imageUrl && (
                <CategoryImageWrapper>
                  <CategoryImage src={category.imageUrl} alt={category.name} width={82} height={82} />
                </CategoryImageWrapper>
              )}
              <h1>{category.name}</h1>
            </CategoryTitle>
            <ArrowButton link="/learn/topics" text="All topics" />
          </ContainerCardSectionTop>

          <ContainerCardSection>
            <CategoryDescription>
              <p>{category.description}</p>
              <i>{articles.length} articles</i>
            </CategoryDescription>

            <LinkSection bgColor={'transparent'} columns={1} padding="0">
              <LinkColumn>
                {articles.map((article) => {
                  const attrs = article.attributes
                  if (!attrs?.title || !attrs?.slug) return null

                  return (
                    <LinkItem
                      key={article.id}
                      href={`/learn/${attrs.slug}`}
                      onClick={() =>
                        analytics.sendEvent({
                          category: CowFiCategory.KNOWLEDGEBASE,
                          action: 'Click article',
                          label: attrs.title,
                        })
                      }
                    >
                      {attrs.title}
                      <span>→</span>
                    </LinkItem>
                  )
                })}
              </LinkColumn>
            </LinkSection>
          </ContainerCardSection>
        </ContainerCardInner>
      </ContainerCard>
    </Wrapper>
  )
}
