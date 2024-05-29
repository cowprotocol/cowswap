import Head from 'next/head'
import { GetStaticProps } from 'next'
import { Color, ProductLogo, ProductVariant } from '@cowprotocol/ui'

import IMG_ICON_BULB_COW from '@cowprotocol/assets/images/icon-bulb-cow.svg'

import IMG_ICON_UNICORN from '@cowprotocol/assets/images/icon-unicorn.svg'
import IMG_ICON_FLOWER_COW from '@cowprotocol/assets/images/icon-flower-cow.svg'

import styled from 'styled-components'

import { CONFIG } from '@/const/meta'

import LayoutV2 from '@/components/Layout/LayoutV2'
import FAQ from '@/components/FAQ'

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
  SectionTitleButton,
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
            <HeroSubtitle color={'#012F7A'}>CoW Swap</HeroSubtitle>
            <HeroTitle fontSize={67} fontSizeMobile={38} as="h2">
              Do what you want, build what you want
            </HeroTitle>
            <HeroDescription>
              CoW Swap has the largest solver competition and the most advanced builder framework on the market
            </HeroDescription>
            <HeroButton background={'#012F7A'} color={'#65D9FF'} href="/start-building">
              Start building
            </HeroButton>
          </HeroContent>
          <HeroImage width={470} height={470} color={'#012F7A'} marginMobile="24px auto 56px">
            <SVG src={IMG_ICON_BULB_COW} />
          </HeroImage>
        </HeroContainer>

        <MetricsCard bgColor="#65D9FF" color="#012F7A" columns={3} touchFooter>
          <MetricsItem dividerColor="#005EB7">
            <h2>18</h2>
            <p>active solvers settling batches</p>
          </MetricsItem>
          <MetricsItem dividerColor="#005EB7">
            <h2>1 in 4</h2>
            <p>user trades go through CoW Protocol</p>
          </MetricsItem>
          <MetricsItem dividerColor="#005EB7">
            <h2>83</h2>
            <p>average NPS score for users of CoW Protocol</p>
          </MetricsItem>
        </MetricsCard>

        <ContainerCard bgColor={Color.neutral98}>
          <ContainerCardSection gap={90}>
            <SectionTitleWrapper color={Color.neutral0} maxWidth={1100} gap={56}>
              <SectionTitleIcon multiple size={80}>
                <SVG src={IMG_ICON_UNICORN} />
                <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly />
                <SVG src={IMG_ICON_UNICORN} className="image-reverse" />
              </SectionTitleIcon>

              <SectionTitleText>CoW Swap is different</SectionTitleText>
              <SectionTitleDescription maxWidth={900}>
                CoW Swap is the only DEX built to give you more for every trade by finding the best liquidity and
                protecting you from MEV
              </SectionTitleDescription>
            </SectionTitleWrapper>

            <TopicList columns={3}>
              <TopicCard contentAlign={'left'} bgColor={Color.neutral90} padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicDescription fontSize={28} color={Color.neutral10}>
                    Thanks to batch auctions, CoW Swap provides surplus you won&apos;t find anywhere
                  </TopicDescription>
                  <TopicButton bgColor="#65D9FF" color="#012F7A" fontSize={27}>
                    Learn more
                  </TopicButton>
                </TopicCardInner>
                <TopicImage iconColor="#65D9FF" bgColor="transparent" margin={'0 0 0 auto'} height={187} width={'auto'}>
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor={Color.neutral90} padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicDescription fontSize={28} color={Color.neutral10}>
                    MEV is a $1.3+ billion problem that you never have to worry about on CoW Swap
                  </TopicDescription>
                  <TopicButton bgColor="#65D9FF" color="#012F7A" fontSize={27}>
                    Learn more
                  </TopicButton>
                </TopicCardInner>
                <TopicImage iconColor="#65D9FF" bgColor="transparent" margin={'0 0 0 auto'} height={187} width={'auto'}>
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor={Color.neutral90} padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicDescription fontSize={28} color={Color.neutral10}>
                    Do more, with great UX, thanks to our unique & innovative architecture
                  </TopicDescription>
                  <TopicButton bgColor="#65D9FF" color="#012F7A" fontSize={27}>
                    Learn more
                  </TopicButton>
                </TopicCardInner>
                <TopicImage iconColor="#65D9FF" bgColor="transparent" margin={'0 0 0 auto'} height={187} width={'auto'}>
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'}>
          <ContainerCardSection>
            <SectionTitleWrapper margin="0">
              <SectionTitleText fontSize={38}>CoW Swap is the first UI built on top of CoW Protocol.</SectionTitleText>
              <SectionTitleButton bgColor="#65D9FF" color="#012F7A" href="/">
                Learn about CoW Swap
              </SectionTitleButton>
            </SectionTitleWrapper>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={Color.neutral10} color={Color.neutral98}>
          <ContainerCardSection>
            <SectionTitleWrapper padding="150px 0 0">
              <SectionTitleIcon size={140}>
                <SVG src={IMG_ICON_FLOWER_COW} />
              </SectionTitleIcon>
              <SectionTitleText fontSize={90}>S-moooo-th trading</SectionTitleText>
              <SectionTitleDescription fontSize={28} color={Color.neutral60}>
                CoW Swap features the smoothest trading experiences in DeFi, allowing you to do more and worry less
              </SectionTitleDescription>
            </SectionTitleWrapper>

            <SectionTitleWrapper>
              <SectionTitleText fontSize={51}>Advanced order types</SectionTitleText>
            </SectionTitleWrapper>
            <TopicList columns={3}>
              <TopicCard contentAlign={'left'} bgColor="#012F7A" textColor="#65D9FF" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100}>Surplus-Capturing Limit Orders</TopicTitle>
                  <TopicDescription fontSize={21} color="#65D9FF">
                    Limit orders allow users to trade an asset at a pre-determined price. CoW Swap is the only DEX that
                    offers surplus on limit orders.
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor="#004293"
                  bgColor="transparent"
                  margin={'auto 0 0 auto'}
                  height={187}
                  width={'auto'}
                >
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#012F7A" textColor="#65D9FF" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100}>TWAP orders</TopicTitle>
                  <TopicDescription fontSize={21} color="#65D9FF">
                    Time-weighed average price (TWAP) orders allow users to trade an asset at fixed intervals over a
                    period of time.
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor="#004293"
                  bgColor="transparent"
                  margin={'auto 0 0 auto'}
                  height={187}
                  width={'auto'}
                >
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#012F7A" textColor="#65D9FF" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100}>Milkman orders</TopicTitle>
                  <TopicDescription fontSize={21} color="#65D9FF">
                    Created by CoW Swap, in collaboration with Yearn.fi, the Milkman contract enables trading using a
                    price oracle.
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor="#004293"
                  bgColor="transparent"
                  margin={'auto 0 0 auto'}
                  height={187}
                  width={'auto'}
                >
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>
            </TopicList>

            <SectionTitleWrapper>
              <SectionTitleText fontSize={51} textAlign="center">
                Swaps that do more
              </SectionTitleText>
            </SectionTitleWrapper>
            <TopicList columns={3}>
              <TopicCard contentAlign={'left'} bgColor="#012F7A" textColor="#65D9FF" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100}>Gasless trades</TopicTitle>
                  <TopicDescription fontSize={21} color="#65D9FF">
                    Deploy conditional orders that only trigger when certain on-chain conditions are met
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor="#004293"
                  bgColor="transparent"
                  margin={'auto 0 0 auto'}
                  height={187}
                  width={'auto'}
                >
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#012F7A" textColor="#65D9FF" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100}>No fees for failed transactions</TopicTitle>
                  <TopicDescription fontSize={21} color="#65D9FF">
                    Add custom pre and post-swap hooks for bridging, staking, depositing, or any DeFi action
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor="#004293"
                  bgColor="transparent"
                  margin={'auto 0 0 auto'}
                  height={187}
                  width={'auto'}
                >
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#012F7A" textColor="#65D9FF" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100}>Execute multiple trades at once</TopicTitle>
                  <TopicDescription fontSize={21} color="#65D9FF">
                    Enjoy ETH-less trading, where all gas fees are paid in the sell token as well as no fees for failed
                    transactions
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor="#004293"
                  bgColor="transparent"
                  margin={'auto 0 0 auto'}
                  height={187}
                  width={'auto'}
                >
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'}>
          <ContainerCardSection>
            <SectionTitleWrapper padding="150px 0 0" maxWidth={1300} color={Color.neutral10}>
              <SectionTitleIcon size={100}>
                <ProductLogo variant={ProductVariant.CowProtocol} theme="light" logoIconOnly />
              </SectionTitleIcon>
              <SectionTitleText fontSize={90} textAlign="center">
                The DEX of choice for whales, DAOs, and pros
              </SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={4}>
              <TopicCard
                contentAlign={'left'}
                bgColor="#012F7A"
                textColor={Color.neutral100}
                padding={'32px'}
                asProp="div"
              >
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100} fontSize={51}>
                    $2,500
                  </TopicTitle>
                  <TopicDescription fontSize={21} color="#65D9FF">
                    Average trade size (more than 2x Uniswap&apos;s)
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard
                contentAlign={'left'}
                bgColor="#012F7A"
                textColor={Color.neutral100}
                padding={'32px'}
                asProp="div"
              >
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100} fontSize={51}>
                    39%
                  </TopicTitle>
                  <TopicDescription fontSize={21} color="#65D9FF">
                    Market share among smart contract wallets
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard
                contentAlign={'left'}
                bgColor="#012F7A"
                textColor={Color.neutral100}
                padding={'32px'}
                asProp="div"
              >
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100} fontSize={51}>
                    42%
                  </TopicTitle>
                  <TopicDescription fontSize={21} color="#65D9FF">
                    Monthly user retention rate – the highest in DeFi
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard
                contentAlign={'left'}
                bgColor="#012F7A"
                textColor={Color.neutral100}
                padding={'32px'}
                asProp="div"
              >
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100} fontSize={51}>
                    #1
                  </TopicTitle>
                  <TopicDescription fontSize={21} color="#65D9FF">
                    Intents-based trading platform
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'}>
          <ContainerCardSection>
            <SectionTitleWrapper maxWidth={878} color={Color.neutral10}>
              <SectionTitleText fontSize={90} textAlign="center">
                Twitter buzz
              </SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={3} maxWidth={900}>
              <TopicCard bgColor={Color.neutral100} padding={'0'} gap={16} asProp="div">
                <TopicCardInner>
                  <blockquote className="twitter-tweet" data-dnt="true">
                    <a href="https://twitter.com/koeppelmann/status/1729455013007684035">Loading X...</a>
                  </blockquote>
                </TopicCardInner>
              </TopicCard>

              <TopicCard bgColor={Color.neutral100} padding={'0'} gap={16} asProp="div">
                <TopicCardInner>
                  <blockquote className="twitter-tweet" data-dnt="true">
                    <a href="https://twitter.com/nomos_paradox/status/1738489297815142736">Loading X...</a>
                  </blockquote>
                </TopicCardInner>
              </TopicCard>

              <TopicCard bgColor={Color.neutral100} padding={'0'} gap={16} asProp="div">
                <TopicCardInner>
                  <blockquote className="twitter-tweet" data-dnt="true">
                    <a href="https://twitter.com/passivenodeinc1/status/1485204781153107973">Loading X...</a>
                  </blockquote>
                </TopicCardInner>
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'}>
          <ContainerCardSection>
            <SectionTitleWrapper maxWidth={878} color={Color.neutral10}>
              <SectionTitleText fontSize={90} textAlign="center">
                Case studies
              </SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={3}>
              <TopicCard bgColor={Color.neutral100} padding={'52px'} gap={16} asProp="div">
                <TopicImage iconColor="#65D9FF" bgColor="transparent" height={96} width={'auto'}>
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
                <TopicCardInner>
                  <TopicTitle fontSize={38}>Aave</TopicTitle>
                  <TopicDescription fontSize={21}>
                    Aave DAO used CoW Swap to swap over $4 million directly into Balancer liquidity pool
                  </TopicDescription>

                  <TopicButton bgColor="#65D9FF" color="#012F7A" fontSize={27}>
                    Read more
                  </TopicButton>
                </TopicCardInner>
              </TopicCard>

              <TopicCard bgColor={Color.neutral100} padding={'52px'} gap={16} asProp="div">
                <TopicImage iconColor="#65D9FF" bgColor="transparent" height={96} width={'auto'}>
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
                <TopicCardInner>
                  <TopicTitle fontSize={38}>ENS</TopicTitle>
                  <TopicDescription fontSize={21}>
                    Aave DAO used CoW Swap to swap over $4 million directly into Balancer liquidity pool
                  </TopicDescription>

                  <TopicButton bgColor="#65D9FF" color="#012F7A" fontSize={27}>
                    Read more
                  </TopicButton>
                </TopicCardInner>
              </TopicCard>

              <TopicCard bgColor={Color.neutral100} padding={'52px'} gap={16} asProp="div">
                <TopicImage iconColor="#65D9FF" bgColor="transparent" height={96} width={'auto'}>
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
                <TopicCardInner>
                  <TopicTitle fontSize={38}>Nexus Mutual</TopicTitle>
                  <TopicDescription fontSize={21}>
                    Aave DAO used CoW Swap to swap over $4 million directly into Balancer liquidity pool
                  </TopicDescription>

                  <TopicButton bgColor="#65D9FF" color="#012F7A" fontSize={27}>
                    Read more
                  </TopicButton>
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

      <script async src="https://platform.twitter.com/widgets.js"></script>
    </LayoutV2>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const siteConfigData = CONFIG

  return {
    props: {
      siteConfigData,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
