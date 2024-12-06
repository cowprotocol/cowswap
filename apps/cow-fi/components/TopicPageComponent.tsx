'use client'

import styled from 'styled-components/macro'
import { CmsImage, Color, Font, Media } from '@cowprotocol/ui'
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
import { clickOnKnowledgeBase } from '../modules/analytics'
import Link from 'next/link'

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

export function TopicPageComponent({ category, allCategories, articles }: TopicPageProps) {
  const { name, description, image } = category.attributes || {}
  const imageUrl = image?.data?.attributes?.url

  return (
    <Wrapper>
      <CategoryLinks allCategories={allCategories} />

      <SearchBar articles={articles} />

      <ContainerCard gap={42} gapMobile={24} minHeight="100vh" alignContent="flex-start" touchFooter>
        <ContainerCardInner maxWidth={970} gap={24} gapMobile={24}>
          <Breadcrumbs padding={'0'}>
            <Link href="/" onClick={() => clickOnKnowledgeBase('click-breadcrumbs-home')}>
              Home
            </Link>
            <Link href="/learn" onClick={() => clickOnKnowledgeBase('click-breadcrumbs-knowledgebase')}>
              Knowledge Base
            </Link>
            <Link href="/learn/topics" onClick={() => clickOnKnowledgeBase('click-breadcrumbs-topics')}>
              Topic
            </Link>
            <span>{name}</span>
          </Breadcrumbs>

          <ContainerCardSectionTop>
            <CategoryTitle>
              {imageUrl && (
                <CategoryImageWrapper>
                  <CategoryImage src={imageUrl} alt={name} width={82} height={82} />
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
                  ) : null,
                )}
              </LinkColumn>
            </LinkSection>
          </ContainerCardSection>
        </ContainerCardInner>
      </ContainerCard>
    </Wrapper>
  )
}
