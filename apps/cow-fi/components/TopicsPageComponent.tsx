'use client'

import { SearchBar } from '@/components/SearchBar'
import {
  ContainerCard,
  ContainerCardInner,
  ContainerCardSection,
  ContainerCardSectionTop,
  ContainerCardSectionTopTitle,
  TopicCard,
  TopicImage,
  TopicList,
  TopicTitle,
} from '@/styles/styled'
import { ArrowButton } from '@/components/ArrowButton'
import { useCowAnalytics } from '@cowprotocol/analytics'
import { CowFiCategory } from 'src/common/analytics/types'
import { CmsImage, Color, Font, Media } from '@cowprotocol/ui'
import { ArticleListResponse } from '../services/cms'
import styled from 'styled-components/macro'

interface PageProps {
  categories: {
    name: string
    slug: string
    description: string
    bgColor: string
    textColor: string
    link: string
    iconColor: string
    imageUrl: string
  }[]
  articles: ArticleListResponse['data']
}

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 42px auto 0;
  gap: 34px;
  max-width: 1760px;

  h1 {
    font-size: 28px;
    font-weight: ${Font.weight.medium};
    color: ${Color.neutral50};
    text-align: center;

    ${Media.upToMedium()} {
      font-size: 18px;
    }
  }

  h2 {
    font-size: 67px;
    text-align: center;

    ${Media.upToMedium()} {
      font-size: 38px;
    }
  }
`

export function TopicsPageComponent({ articles, categories }: PageProps) {
  const analytics = useCowAnalytics()

  return (
    <Wrapper>
      <h1>Knowledge Base</h1>
      <h2>All Topics</h2>

      <SearchBar />

      <ContainerCard touchFooter>
        <ContainerCardInner maxWidth={970} gap={24} gapMobile={24}>
          <ContainerCardSection>
            <ContainerCardSectionTop>
              <ContainerCardSectionTopTitle>Topics</ContainerCardSectionTopTitle>
              <ArrowButton link="/learn" text="Overview" />
            </ContainerCardSectionTop>
            <TopicList columns={3}>
              {categories.map(({ name, bgColor, textColor, iconColor, link, imageUrl }, index) => (
                <TopicCard
                  key={index}
                  bgColor={bgColor}
                  textColor={textColor}
                  href={link}
                  onClick={() =>
                    analytics.sendEvent({
                      category: CowFiCategory.KNOWLEDGEBASE,
                      action: 'Click topic',
                      label: name,
                    })
                  }
                >
                  <TopicImage iconColor={iconColor}>
                    {imageUrl ? (
                      <CmsImage
                        src={imageUrl}
                        alt={name}
                        width={82}
                        height={82}
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <span>{name.charAt(0)}</span>
                    )}
                  </TopicImage>
                  <TopicTitle>{name}</TopicTitle>
                </TopicCard>
              ))}
            </TopicList>
          </ContainerCardSection>
        </ContainerCardInner>
      </ContainerCard>
    </Wrapper>
  )
}
