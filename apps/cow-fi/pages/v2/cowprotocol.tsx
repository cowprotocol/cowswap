import Head from 'next/head'
import { GetStaticProps } from 'next'
import { Font, Color, Media, ProductLogo, ProductVariant } from '@cowprotocol/ui'
import IMG_ICON_CROWN_ICON from '@cowprotocol/assets/images/icon-crown-cow.svg'
import IMG_ICON_GOVERNANCE from '@cowprotocol/assets/images/icon-governance.svg'

import styled, { createGlobalStyle } from 'styled-components'

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
  TopicDescription,
  TopicButton,
  SectionTitleWrapper,
  SectionTitleIcon,
  SectionTitleText,
  SectionTitleDescription,
  TopicCardInner,
  HeroContainer,
  HeroImage,
  HeroButton,
  HeroDescription,
  HeroContent,
  HeroTitle,
  HeroSubtitle,
  MetricsCard,
  MetricsItem,
} from '@/styles/styled'

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

const GlobalStyle = createGlobalStyle`
  body {
    background: ${Color.neutral90};  
  }
`

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  max-width: 1600px;
  width: 100%;
  margin: 76px auto 0;
  gap: 24px;
`

export default function HomeLanding({ siteConfigData }: HomeLandingProps) {
  return (
    <LayoutV2>
      <Head>
        <title>
          {siteConfigData.title} - {siteConfigData.descriptionShort}
        </title>
      </Head>

      <GlobalStyle />

      <Wrapper>
        <HeroContainer variant="secondary" maxWidth={1300}>
          <HeroContent variant="secondary">
            <HeroSubtitle color={'#66018E'}>CoW Protocol</HeroSubtitle>
            <HeroTitle fontSize={67} fontSizeMobile={38} as="h2">
              Do what you want, build what you want
            </HeroTitle>
            <HeroDescription>
              CoW Protocol has the largest solver competition and the most advanced builder framework on the market
            </HeroDescription>
            <HeroButton background={'#66018E'} color={'#F996EE'} href="/start-building">
              Start building
            </HeroButton>
          </HeroContent>
          <HeroImage width={470}>
            <img src={IMG_ICON_GOVERNANCE} alt="CoW Protocol" />
          </HeroImage>
        </HeroContainer>

        <MetricsCard bgColor="#F996EE" color="#66018E" columns={3} touchFooter>
          <MetricsItem dividerColor="#ED60E9">
            <h2>18</h2>
            <p>active solvers settling batches</p>
          </MetricsItem>
          <MetricsItem dividerColor="#ED60E9">
            <h2>1 in 4</h2>
            <p>user trades go through CoW Protocol</p>
          </MetricsItem>
          <MetricsItem dividerColor="#ED60E9">
            <h2>83</h2>
            <p>average NPS score for users of CoW Protocol</p>
          </MetricsItem>
        </MetricsCard>

        <ContainerCard bgColor={Color.neutral98}>
          <ContainerCardSection>
            <SectionTitleWrapper color={Color.neutral0} maxWidth={1100}>
              <SectionTitleIcon size={98}>
                <SVG src={IMG_ICON_CROWN_ICON} />
              </SectionTitleIcon>
              <SectionTitleText>The leading intents-based DEX aggregator</SectionTitleText>
              <SectionTitleDescription maxWidth={900}>
                CoW Protocol uses an intents-based trading system alongside batch auctions to bring surplus-capturing,
                MEV protected swaps to users.
              </SectionTitleDescription>
            </SectionTitleWrapper>

            <TopicList columns={2}>
              <TopicCard contentAlign={'left'} bgColor="#490072" textColor="#F996EE" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={51} fontWeight={Font.weight.bold}>
                    CoW Protocol
                  </TopicTitle>
                  <TopicDescription fontSize={28} color="#F996EE">
                    Open-source, permissionless DEX innovation
                  </TopicDescription>
                  <TopicButton bgColor="#F996EE" color="#490072">
                    Start building
                  </TopicButton>
                </TopicCardInner>
                <TopicImage iconColor="#8702AA" bgColor="transparent" margin={'0 0 0 auto'} height={187} width={'auto'}>
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#65D9FF" textColor="#012F7A" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={51} fontWeight={Font.weight.bold}>
                    CoW Swap
                  </TopicTitle>
                  <TopicDescription fontSize={28} color="#012F7A">
                    The DEX that lets you do what you want
                  </TopicDescription>
                  <TopicButton bgColor="#012F7A" color="#65D9FF">
                    Start swapping
                  </TopicButton>
                </TopicCardInner>
                <TopicImage iconColor="#CCF8FF" bgColor="transparent" margin={'0 0 0 auto'} height={187} width={'auto'}>
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#194D06" textColor="#BCEC79" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={51} fontWeight={Font.weight.bold}>
                    CoW AMM
                  </TopicTitle>
                  <TopicDescription fontSize={28} color="#BCEC79">
                    The first MEV-capturing AMM
                  </TopicDescription>
                  <TopicButton bgColor="#BCEC79" color="#194D06">
                    Deposit liquidity
                  </TopicButton>
                </TopicCardInner>
                <TopicImage iconColor="#408A13" bgColor="transparent" margin={'0 0 0 auto'} height={187} width={'auto'}>
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#FEE7CF" textColor="#EC4612" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={51} fontWeight={Font.weight.bold}>
                    MEV Blocker
                  </TopicTitle>
                  <TopicDescription fontSize={28} color="#EC4612">
                    The best MEV protection under the sun
                  </TopicDescription>
                  <TopicButton bgColor="#EC4612" color="#FEE7CF">
                    Get protected
                  </TopicButton>
                </TopicCardInner>
                <TopicImage iconColor="#FDC99F" bgColor="transparent" margin={'0 0 0 auto'} height={187} width={'auto'}>
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'}>
          <ContainerCardSection>
            <SectionTitleWrapper>
              <SectionTitleIcon>
                <SVG src={IMG_ICON_GOVERNANCE} />
              </SectionTitleIcon>
              <SectionTitleText>Governance</SectionTitleText>
              <SectionTitleDescription maxWidth={900}>
                By getting involved, you can further CoW DAO&apos;s mission of creating the most protective products on
                Ethereum
              </SectionTitleDescription>
            </SectionTitleWrapper>

            <TopicList columns={1} maxWidth={1000}>
              <TopicCard columns="2fr auto" horizontal asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={67}>Forum</TopicTitle>
                  <TopicDescription fontSize={28}>
                    CoW Protocol users sign an "intent to trade" message instead of directly executing orders on-chain
                    (like on Uniswap). This lets solvers trade on behalf of the user.
                  </TopicDescription>
                  <TopicButton href="/knowledge-base">Learn more</TopicButton>
                </TopicCardInner>
                <TopicImage iconColor="#FF4500" large orderReverseMobile />
              </TopicCard>

              <TopicCard columns={'auto 2fr'} horizontal asProp="div">
                <TopicImage iconColor="#4B0082" large orderReverseMobile />

                <TopicCardInner contentAlign={'left'}>
                  <TopicTitle fontSize={67}>Token</TopicTitle>
                  <TopicDescription fontSize={28}>
                    Professional third parties known as “solvers” find the most optimal path for each trade and protect
                    assets from MEV
                  </TopicDescription>
                  <TopicButton href="/docs">Learn more</TopicButton>
                </TopicCardInner>
              </TopicCard>

              <TopicCard columns={'2fr auto'} horizontal asProp="div">
                <TopicCardInner contentAlign={'left'}>
                  <TopicTitle fontSize={67}>Snapshot</TopicTitle>
                  <TopicDescription fontSize={28}>
                    CoW Protocol collects intents into a batch and then auctions it off to solvers. The solver that can
                    provide the most surplus for users gets to settle the batch.
                  </TopicDescription>
                  <TopicButton href="https://discord.com">Learn more</TopicButton>
                </TopicCardInner>

                <TopicImage iconColor="#1E90FF" large orderReverseMobile />
              </TopicCard>
            </TopicList>
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

        <ContainerCard bgColor={'transparent'} touchFooter>
          <ContainerCardSection padding={'0 0 100px'}>
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
