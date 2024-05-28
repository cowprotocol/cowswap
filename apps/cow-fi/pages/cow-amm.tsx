import Head from 'next/head'
import { GetStaticProps } from 'next'
import { Color, ProductLogo, ProductVariant } from '@cowprotocol/ui'
import IMG_ICON_CROWN_COW from '@cowprotocol/assets/images/icon-crown-cow.svg'
import IMG_ICON_GOVERNANCE from '@cowprotocol/assets/images/icon-governance.svg'
import IMG_ICON_BULB_COW from '@cowprotocol/assets/images/icon-bulb-cow.svg'
import IMG_ICON_BUILD_WITH_COW from '@cowprotocol/assets/images/icon-build-with-cow.svg'

import styled from 'styled-components'

import { CONFIG } from '@/const/meta'

import LayoutV2 from '@/components/Layout/LayoutV2'
import FAQ from '@/components/FAQ'
import { getCategories, getArticles, Category, ArticleListResponse } from 'services/cms'

import {
  ContainerCard,
  ContainerCardSection,
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
  SectionImage,
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
`

export default function Page({ siteConfigData }: PageProps) {
  return (
    <LayoutV2 bgColor={Color.neutral90}>
      <Head>
        <title>
          {siteConfigData.title} - {siteConfigData.descriptionShort}
        </title>
      </Head>

      <Wrapper>
        <HeroContainer variant="secondary" maxWidth={1300}>
          <HeroContent variant="secondary">
            <HeroSubtitle color={'#194D05'}>CoW AMM</HeroSubtitle>
            <HeroTitle fontSize={67} fontSizeMobile={38} as="h2">
              The first MEV-capturing AMM
            </HeroTitle>
            <HeroDescription>
              CoW Protocol has the largest solver competition and the most advanced builder framework on the market
            </HeroDescription>
            <HeroButton background={'#194D05'} color={'#BCEC79'} href="/start-building">
              Protect your liquidity
            </HeroButton>
          </HeroContent>
          <HeroImage width={470} color={'#194D05'} marginMobile="24px auto 56px">
            <SVG src={IMG_ICON_GOVERNANCE} />
          </HeroImage>
        </HeroContainer>

        <MetricsCard bgColor={Color.neutral100} color="#194D05" columns={3} touchFooter>
          <MetricsItem dividerColor="#9BD955">
            <h2>18</h2>
            <p>active solvers settling batches</p>
          </MetricsItem>
          <MetricsItem dividerColor="#9BD955">
            <h2>1 in 4</h2>
            <p>user trades go through CoW Protocol</p>
          </MetricsItem>
          <MetricsItem dividerColor="#9BD955">
            <h2>83</h2>
            <p>average NPS score for users of CoW Protocol</p>
          </MetricsItem>
        </MetricsCard>

        <ContainerCard bgColor={Color.neutral10}>
          <ContainerCardSection>
            <SectionTitleWrapper color={Color.neutral100} maxWidth={1100} gap={56}>
              <SectionTitleIcon size={98}>
                <SVG src={IMG_ICON_CROWN_COW} />
              </SectionTitleIcon>
              <SectionTitleText>AMMs don&apos;t want you to know about LVR</SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={1} maxWidth={1470}>
              <TopicCard columns="1fr auto" gap={100} horizontal asProp="div" bgColor="transparent" paddingMobile={'0'}>
                <TopicCardInner contentAlign="left">
                  <TopicDescription fontSize={28} color={Color.neutral95}>
                    Liquidity providers expect their tokens to earn yield, but the dirty little secret of AMMs is that
                    most liquidity pools lose money. <br />
                    <br />
                    In fact, hundreds of millions of dollars of LP funds are stolen by arbitrageurs every year 1. These
                    losses are known as loss-versus-rebalancing (LVR). LVR is a bigger source of MEV than frontrunning
                    and sandwich attacks combined.
                  </TopicDescription>

                  <TopicDescription fontSize={21} color={Color.neutral50}>
                    1 Andrea Canidio and Robin Fritsch, Arbitrageurs' profits, LVR, and sandwich attacks: batch trading
                    as an AMM design response (November 2023).
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage iconColor="#66018E" width={590} height={590} heightMobile={300} orderReverseMobile />
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'}>
          <ContainerCardSection>
            <SectionTitleWrapper padding="150px 0 0" marginMobile="0 auto" maxWidth={1170} color={Color.neutral10}>
              <SectionTitleIcon size={128}>
                <SVG src={IMG_ICON_BULB_COW} />
              </SectionTitleIcon>
              <SectionTitleText fontSize={90} textAlign="center">
                Finally, an AMM designed with LPs in mind
              </SectionTitleText>
              <SectionTitleDescription fontSize={38} textAlign="center">
                CoW AMM eliminates LVR once and for all by using batch auctions to send surplus to LPs
              </SectionTitleDescription>
            </SectionTitleWrapper>

            <TopicList columns={4}>
              <TopicCard
                gap={0}
                contentAlign={'left'}
                bgColor="#194D05"
                textColor="#BCEC79"
                padding={'24px'}
                asProp="div"
              >
                <TopicImage iconColor="#BCEC79" bgColor="transparent" height={'auto'} width={'100%'}>
                  <SVG src={IMG_ICON_BUILD_WITH_COW} />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicDescription fontSize={21}>
                    Liquidity providers deposit tokens into protected CoW AMM liquidity pools, where traders can access
                    the liquidity
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard
                gap={0}
                contentAlign={'left'}
                bgColor="#194D05"
                textColor="#BCEC79"
                padding={'24px'}
                asProp="div"
              >
                <TopicImage iconColor="#BCEC79" bgColor="transparent" height={'auto'} width={'100%'}>
                  <SVG src={IMG_ICON_BUILD_WITH_COW} />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicDescription fontSize={21}>
                    Solvers bid to rebalance CoW AMM pools whenever there is an arbitrage opportunity
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard
                gap={0}
                contentAlign={'left'}
                bgColor="#194D05"
                textColor="#BCEC79"
                padding={'24px'}
                asProp="div"
              >
                <TopicImage iconColor="#BCEC79" bgColor="transparent" height={'auto'} width={'100%'}>
                  <SVG src={IMG_ICON_BUILD_WITH_COW} />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicDescription fontSize={21}>
                    The solver that offers the most surplus to the pool wins the right to rebalance the pool
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard
                gap={0}
                contentAlign={'left'}
                bgColor="#194D05"
                textColor="#BCEC79"
                padding={'24px'}
                asProp="div"
              >
                <TopicImage iconColor="#BCEC79" bgColor="transparent" height={'auto'} width={'100%'}>
                  <SVG src={IMG_ICON_BUILD_WITH_COW} />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicDescription fontSize={21}>
                    CoW AMM eliminates LVR by capturing arbitrage value for LPs and shielding it from MEV bots
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={Color.neutral100}>
          <ContainerCardSection>
            <SectionTitleWrapper color={Color.neutral10} maxWidth={1100} gap={56}>
              <SectionTitleIcon size={98}>
                <SVG src={IMG_ICON_CROWN_COW} />
              </SectionTitleIcon>
              <SectionTitleText>
                Raising the <s>bar</s> curve
              </SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={1} maxWidth={1470}>
              <TopicCard columns="1fr auto" gap={100} horizontal asProp="div" bgColor="transparent" paddingMobile="0">
                <TopicCardInner contentAlign="left">
                  <TopicDescription fontSize={28}>
                    CoW AMM LPs don't have to worry about LVR, which costs CF-AMM LPs 5-7% of their liquidity, on
                    average.
                    <br />
                    <br />
                    Backtesting research conducted over 6 months in 2023 shows that CoW AMM returns would have equalled
                    or outperformed CFAMM returns for 10 of the 11 most liquid, non-stablecoin pairs.
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage iconColor="#194D05" width={590} height={590} heightMobile={300} orderReverseMobile />
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'}>
          <ContainerCardSection>
            <SectionTitleWrapper color={Color.neutral10} maxWidth={1100} gap={56}>
              <SectionTitleIcon size={98}>
                <SVG src={IMG_ICON_BULB_COW} />
              </SectionTitleIcon>
              <SectionTitleText>CoW AMM benefits LPs of all types</SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={1} maxWidth={1470}>
              <TopicCard columns="1fr auto" gap={100} horizontal asProp="div" bgColor="transparent" paddingMobile="0">
                <TopicImage iconColor="#194D05" width={590} height={590} heightMobile={300} orderReverseMobile />
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={67}>Support DAO token liquidity without the stick-up</TopicTitle>
                  <TopicDescription fontSize={28} color={Color.neutral50}>
                    Healthy liquidity for DAO tokens reduces price impact, encourages investment and discourages
                    volatility. But DAOs can be reluctant to provide liquidity with treasury funds when their pools can
                    be exploited by arbitrageurs. CoW AMM makes providing liquidity more attractive to DAOs of all
                    sizes.
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard columns="1fr auto" gap={100} horizontal asProp="div" bgColor="transparent" paddingMobile="0">
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={67}>Unlock the power of passive investing</TopicTitle>
                  <TopicDescription fontSize={28} color={Color.neutral50}>
                    With LVR in the rear view mirror, providing liquidity becomes identical to running a passive
                    investment strategy: solvers rebalance the pool at the correct market price to keep the value of its
                    reserves equal - thereby keeping portfolios balanced and reducing risk.
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage iconColor="#194D05" width={590} height={590} heightMobile={300} orderReverseMobile />
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={Color.neutral10} color={Color.neutral98}>
          <ContainerCardSection>
            <SectionTitleWrapper padding="150px 0 56px">
              <SectionTitleIcon size={100}>
                <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly />
              </SectionTitleIcon>
              <SectionTitleText fontSize={90}>Trust the experts</SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={3}>
              <TopicCard contentAlign={'left'} bgColor="#BCEC79" textColor="#194D05" padding={'24px'} asProp="div">
                <TopicCardInner height="100%" contentAlign="left" gap={52}>
                  <TopicTitle fontSize={28}>
                    "When LPs bleed money to LVR, users pay for it with bigger spreads. If we want DeFi to rival the CEX
                    experience, solving LVR will be the key."
                  </TopicTitle>
                  <TopicDescription margin="auto 0 0" fontSize={21}>
                    - Hasu
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#BCEC79" textColor="#194D05" padding={'24px'} asProp="div">
                <TopicCardInner height="100%" contentAlign="left" gap={52}>
                  <TopicTitle fontSize={28}>
                    "Impermanent loss is a big worry for many of our clients. If LPs could deposit liquidity into
                    surplus-rebalancing pools and not worry about LVR, we’d deposit more funds into passive investment
                    strategies."
                  </TopicTitle>
                  <TopicDescription margin="auto 0 0" fontSize={21}>
                    - Marcelo
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#BCEC79" textColor="#194D05" padding={'24px'} asProp="div">
                <TopicCardInner height="100%" contentAlign="left" gap={52}>
                  <TopicTitle fontSize={28}>
                    "LVR is the main reason for the current concentration in the block builder market. CoW AMM is not
                    only great for LPs, it's important for Ethereum overall."
                  </TopicTitle>
                  <TopicDescription margin="auto 0 0" fontSize={21}>
                    - Josojo
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'} color={Color.neutral10} touchFooter>
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

export const getStaticProps: GetStaticProps<PageProps> = async () => {
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
