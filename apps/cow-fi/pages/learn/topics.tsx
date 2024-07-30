import { GetStaticProps } from 'next'
import { Font, Color, Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import Layout from '@/components/Layout'
import { getCategories, getArticles, ArticleListResponse } from 'services/cms'

import { SearchBar } from '@/components/SearchBar'
import { ArrowButton } from '@/components/ArrowButton'

import {
  ContainerCard,
  ContainerCardSection,
  ContainerCardInner,
  ContainerCardSectionTop,
  TopicList,
  TopicCard,
  TopicImage,
  ContainerCardSectionTopTitle,
  TopicTitle,
} from '@/styles/styled'

import { CONFIG, DATA_CACHE_TIME_SECONDS } from '@/const/meta'
import { clickOnKnowledgeBase } from 'modules/analytics'
import { CmsImage } from '@cowprotocol/ui'

interface PageProps {
  siteConfigData: typeof CONFIG
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

export default function Page({ siteConfigData, categories, articles }: PageProps) {
  const { title } = siteConfigData

  return (
    <Layout metaTitle={`Knowledge Base topics - ${title}`} metaDescription="All knowledge base topics">
      <Wrapper>
        <h1>Knowledge Base</h1>
        <h2>All Topics</h2>

        <SearchBar articles={articles || []} />

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
                    onClick={() => clickOnKnowledgeBase(`click-topic-${name}`)}
                  >
                    <TopicImage iconColor={iconColor}>
                      {imageUrl ? (
                        <CmsImage
                          src={imageUrl}
                          alt={name}
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
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const siteConfigData = CONFIG
  const categoriesResponse = await getCategories()
  const articlesResponse = await getArticles()

  const categories =
    categoriesResponse?.map((category: any) => {
      const imageUrl = category?.attributes?.image?.data?.attributes?.url || ''

      return {
        name: category?.attributes?.name || '',
        slug: category?.attributes?.slug || '',
        description: category?.attributes?.description || '',
        bgColor: category?.attributes?.backgroundColor || '#fff',
        textColor: category?.attributes?.textColor || '#000',
        link: `/learn/topic/${category?.attributes?.slug}`,
        iconColor: 'transparent',
        imageUrl,
      }
    }) || []

  return {
    props: {
      siteConfigData,
      categories,
      articles: articlesResponse.data,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
