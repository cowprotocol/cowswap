import Head from 'next/head'
import { GetStaticProps } from 'next'
import { Font, Color, Media, ProductLogo, ProductVariant } from '@cowprotocol/ui'

import styled from 'styled-components'

import { CONFIG } from '@/const/meta'

import LayoutV2 from '@/components/Layout/LayoutV2'
import FAQ from '@/components/FAQ'
import { getCategories, getArticles, Category, ArticleListResponse } from 'services/cms'

import {
  ContainerCard,
  ContainerCardSection,
  ContainerCardSectionTop,
  ContainerCardSectionTopTitle,
  ContainerCardSectionTopDescription,
  TopicList,
  TopicCard,
  TopicImage,
  TopicTitle,
  SectionTitleWrapper,
  SectionTitleIcon,
  SectionTitleText,
  SectionTitleDescription,
} from './styled'

import SVG from 'react-inlinesvg'
import IMG_ICON_FAQ from '@cowprotocol/assets/images/icon-faq.svg'

const DATA_CACHE_TIME_SECONDS = 5 * 60 // Cache 5min

const FAQ_DATA = [
  {
    question: 'What is CoW DAO?',
    answer: 'CoW DAO is ...',
  },
  {
    question: 'What is CoW Swap?',
    answer:
      'CoW Protocol is a fully permissionless trading protocol that leverages batch auctions as its price finding mechanism. CoW Protocol uses batch auctions to maximize liquidity via Coincidence of Wants (CoWs) in addition to tapping all available on-chain liquidity whenever needed.',
  },
  {
    question: 'What is MEV Blocker?',
    answer: 'MEV Blocker is ...',
  },
  {
    question: 'What is CoW AMM?',
    answer: 'CoW AMM is ...',
  },
  {
    question: 'Where does the name come from?',
    answer: 'The name comes from ...',
  },
]

interface HomeLandingProps {
  siteConfigData: typeof CONFIG
  categories: {
    name: string
    slug: string
    description: string
    bgColor: string
    textColor: string
    link: string
    iconColor: string
  }[]
  articles: ArticleListResponse['data']
}

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  max-width: 1600px;
  width: 100%;
  margin: 76px auto 0;
  gap: 24px;

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

export default function HomeLanding({ siteConfigData }: HomeLandingProps) {
  return (
    <LayoutV2>
      <Head>
        <title>
          {siteConfigData.title} - {siteConfigData.descriptionShort}
        </title>
      </Head>

      <Wrapper>
        <h1>Don&apos;t get milked!</h1>
        <h2>CoW DAO protects users from the dangers of DeFi</h2>

        <ContainerCard bgColor={Color.neutral90}>
          <ContainerCardSection>
            <SectionTitleWrapper>
              <SectionTitleIcon>
                <SVG src={IMG_ICON_FAQ} />
              </SectionTitleIcon>
              <SectionTitleText>Governance</SectionTitleText>
              <SectionTitleDescription>
                By getting involved, you can further CoW DAO&apos;s mission of creating the most protective products on
                Ethereum
              </SectionTitleDescription>
            </SectionTitleWrapper>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={Color.neutral10} color={Color.neutral98}>
          <ContainerCardSection>
            <ContainerCardSectionTop columnWrap padding="150px 0">
              <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly height={60} />
              <ContainerCardSectionTopTitle fontSize={90} textAlign="center">
                New to the barn?
              </ContainerCardSectionTopTitle>
              <ContainerCardSectionTopDescription fontSize={28} color={Color.neutral60} textAlign="center">
                The green pastures of CoW DAO are the friendliest place in all of DeFi... Welcome!
              </ContainerCardSectionTopDescription>
            </ContainerCardSectionTop>

            <TopicList columns={3}>
              <TopicCard textColor="#000000" href="/knowledge-base">
                <TopicImage iconColor="#FF4500" large></TopicImage>
                <TopicTitle fontSize={38}>Knowledge Base</TopicTitle>
              </TopicCard>

              <TopicCard textColor="#000000" href="/docs">
                <TopicImage iconColor="#4B0082" large></TopicImage>
                <TopicTitle fontSize={38}>Docs</TopicTitle>
              </TopicCard>

              <TopicCard textColor="#000000" href="https://discord.com">
                <TopicImage iconColor="#1E90FF" large></TopicImage>
                <TopicTitle fontSize={38}>Discord</TopicTitle>
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={Color.neutral90} touchFooter>
          <ContainerCardSection>
            <SectionTitleWrapper>
              <SectionTitleIcon>
                <SVG src={IMG_ICON_FAQ} />
              </SectionTitleIcon>
              <SectionTitleText>FAQs</SectionTitleText>
            </SectionTitleWrapper>

            <FAQ faqs={FAQ_DATA} />
          </ContainerCardSection>
        </ContainerCard>
      </Wrapper>
    </LayoutV2>
  )
}

export const getStaticProps: GetStaticProps<HomeLandingProps> = async () => {
  const siteConfigData = CONFIG
  const categoriesResponse = await getCategories()
  const articlesResponse = await getArticles()

  const categories =
    categoriesResponse?.map((category: Category) => ({
      name: category?.attributes?.name || '',
      slug: category?.attributes?.slug || '',
      description: category?.attributes?.description || '',
      bgColor: category?.attributes?.backgroundColor || '#fff',
      textColor: category?.attributes?.textColor || '#000',
      link: `/topic/${category?.attributes?.slug}`,
      iconColor: '#fff',
    })) || []

  return {
    props: {
      siteConfigData,
      categories,
      articles: articlesResponse.data,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
