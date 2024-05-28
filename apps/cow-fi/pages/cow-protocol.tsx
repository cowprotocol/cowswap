import Head from 'next/head'
import { GetStaticProps } from 'next'
import { Font, Color, Media, ProductLogo, ProductVariant } from '@cowprotocol/ui'
import IMG_ICON_CROWN_COW from '@cowprotocol/assets/images/icon-crown-cow.svg'
import IMG_ICON_GOVERNANCE from '@cowprotocol/assets/images/icon-governance.svg'
import IMG_ICON_BULB_COW from '@cowprotocol/assets/images/icon-bulb-cow.svg'
import IMG_ICON_BUILD_WITH_COW from '@cowprotocol/assets/images/icon-build-with-cow.svg'
import IMG_ICON_SECURE from '@cowprotocol/assets/images/icon-secure.svg'
import IMG_ICON_OWL from '@cowprotocol/assets/images/icon-owl.svg'
import IMG_ICON_GHOST from '@cowprotocol/assets/images/icon-ghost.svg'
import IMG_LOGO_SAFE from '@cowprotocol/assets/images/logo-safe.svg'
import IMG_LOGO_OASIS from '@cowprotocol/assets/images/logo-oasis.svg'

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
          <HeroImage width={470} color={'#66018E'}>
            <SVG src={IMG_ICON_GOVERNANCE} />
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
            <SectionTitleWrapper color={Color.neutral0} maxWidth={1100} gap={56}>
              <SectionTitleIcon size={98}>
                <SVG src={IMG_ICON_CROWN_COW} />
              </SectionTitleIcon>
              <SectionTitleText>The leading intents-based DEX aggregator</SectionTitleText>
              <SectionTitleDescription maxWidth={900}>
                CoW Protocol uses an intents-based trading system alongside batch auctions to bring surplus-capturing,
                MEV protected swaps to users.
              </SectionTitleDescription>
            </SectionTitleWrapper>

            <SectionImage bgColor={'#66018E'}>
              {/* <img src={IMG_ICON_GOVERNANCE} alt="CoW Protocol" /> */}
            </SectionImage>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'}>
          <ContainerCardSection>
            <SectionTitleWrapper>
              <SectionTitleIcon size={100}>
                <ProductLogo variant={ProductVariant.CowProtocol} theme="light" logoIconOnly />
              </SectionTitleIcon>
              <SectionTitleText>How it works?</SectionTitleText>
              <SectionTitleDescription maxWidth={900}>
                Through intents, a network of solvers, and batch auctions, CoW Protocol stands out from every other DEX
              </SectionTitleDescription>
            </SectionTitleWrapper>

            <TopicList columns={1} maxWidth={1470}>
              <TopicCard columns="1fr auto" gap={100} horizontal asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={67}>Intents</TopicTitle>
                  <TopicDescription fontSize={28}>
                    CoW Protocol users sign an "intent to trade" message instead of directly executing orders on-chain
                    (like on Uniswap). This lets solvers trade on behalf of the user
                  </TopicDescription>
                  <TopicButton bgColor="#66018E" color="#F996EE" href="/knowledge-base">
                    Learn more
                  </TopicButton>
                </TopicCardInner>
                <TopicImage iconColor="#66018E" width={590} height={590} heightMobile={300} orderReverseMobile />
              </TopicCard>

              <TopicCard columns="1fr auto" gap={100} horizontal asProp="div">
                <TopicImage iconColor="#66018E" width={590} height={590} heightMobile={300} orderReverseMobile />
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={67}>Solvers</TopicTitle>
                  <TopicDescription fontSize={28}>
                    Professional third parties known as “solvers” find the most optimal path for each trade and protect
                    assets from MEV
                  </TopicDescription>
                  <TopicButton bgColor="#66018E" color="#F996EE" href="/knowledge-base">
                    Learn more
                  </TopicButton>
                </TopicCardInner>
              </TopicCard>

              <TopicCard columns="1fr auto" gap={100} horizontal asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={67}>Batch Auctions</TopicTitle>
                  <TopicDescription fontSize={28}>
                    CoW Protocol collects intents into a batch and then auctions it off to solvers. The solver that can
                    provide the most surplus for users gets to settle the batch
                  </TopicDescription>
                  <TopicButton bgColor="#66018E" color="#F996EE" href="/knowledge-base">
                    Learn more
                  </TopicButton>
                </TopicCardInner>
                <TopicImage iconColor="#66018E" width={590} height={590} heightMobile={300} orderReverseMobile />
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={Color.neutral10} color={Color.neutral98}>
          <ContainerCardSection>
            <SectionTitleWrapper padding="150px 0 0">
              <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly height={60} />
              <SectionTitleText fontSize={90}>Going where others can&apos;t</SectionTitleText>
              <SectionTitleDescription fontSize={28} color={Color.neutral60}>
                Thanks to its unique architecture, CoW Protocol can do things other DEX&apos;s can&apos;t
              </SectionTitleDescription>
            </SectionTitleWrapper>

            <SectionTitleWrapper padding="50px 0">
              <SectionTitleText fontSize={51}>Advanced order types</SectionTitleText>
            </SectionTitleWrapper>
            <TopicList columns={3}>
              <TopicCard contentAlign={'left'} bgColor="#66018E" textColor="#F996EE" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100}>Surplus-Capturing Limit Orders</TopicTitle>
                  <TopicDescription fontSize={21} color="#F996EE">
                    Limit orders allow users to trade an asset at a pre-determined price. CoW Swap is the only DEX that
                    offers surplus on limit orders.
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor="#8702AA"
                  bgColor="transparent"
                  margin={'auto 0 0 auto'}
                  height={187}
                  width={'auto'}
                >
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#66018E" textColor="#F996EE" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100}>TWAP orders</TopicTitle>
                  <TopicDescription fontSize={21} color="#F996EE">
                    Time-weighed average price (TWAP) orders allow users to trade an asset at fixed intervals over a
                    period of time.
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor="#8702AA"
                  bgColor="transparent"
                  margin={'auto 0 0 auto'}
                  height={187}
                  width={'auto'}
                >
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#66018E" textColor="#F996EE" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100}>Milkman orders</TopicTitle>
                  <TopicDescription fontSize={21} color="#F996EE">
                    Created by CoW Swap, in collaboration with Yearn.fi, the Milkman contract enables trading using a
                    price oracle.
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor="#8702AA"
                  bgColor="transparent"
                  margin={'auto 0 0 auto'}
                  height={187}
                  width={'auto'}
                >
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>
            </TopicList>

            <SectionTitleWrapper padding="150px 0 50px">
              <SectionTitleText fontSize={51} textAlign="center">
                Unique smart orders
              </SectionTitleText>
            </SectionTitleWrapper>
            <TopicList columns={3}>
              <TopicCard contentAlign={'left'} bgColor="#66018E" textColor="#F996EE" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100}>Programmatic Orders</TopicTitle>
                  <TopicDescription fontSize={21} color="#F996EE">
                    Deploy conditional orders that only trigger when certain on-chain conditions are met
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor="#8702AA"
                  bgColor="transparent"
                  margin={'auto 0 0 auto'}
                  height={187}
                  width={'auto'}
                >
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#66018E" textColor="#F996EE" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100}>CoW Hooks</TopicTitle>
                  <TopicDescription fontSize={21} color="#F996EE">
                    Add custom pre and post-swap hooks for bridging, staking, depositing, or any DeFi action
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor="#8702AA"
                  bgColor="transparent"
                  margin={'auto 0 0 auto'}
                  height={187}
                  width={'auto'}
                >
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#66018E" textColor="#F996EE" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100}>Smart orders</TopicTitle>
                  <TopicDescription fontSize={21} color="#F996EE">
                    Enjoy ETH-less trading, where all gas fees are paid in the sell token as well as no fees for failed
                    transactions
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor="#8702AA"
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
            <SectionTitleWrapper padding="150px 0 0" maxWidth={878} color={Color.neutral10}>
              <SectionTitleIcon size={128}>
                <SVG src={IMG_ICON_BULB_COW} />
              </SectionTitleIcon>
              <SectionTitleText fontSize={90} textAlign="center">
                Powering innovation across DeFi
              </SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={3}>
              <TopicCard contentAlign={'left'} bgColor="#66018E" textColor="#F996EE" padding={'32px'} asProp="div">
                <TopicImage iconColor="#8702AA" bgColor="transparent" height={96} width={'auto'}>
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100} fontSize={38}>
                    Liquidations
                  </TopicTitle>
                  <TopicDescription fontSize={21} color="#F996EE">
                    Info about liquidations goes here. Info about liquidations goes here. Info about liquidations goes
                    here.
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#66018E" textColor="#F996EE" padding={'32px'} asProp="div">
                <TopicImage iconColor="#8702AA" bgColor="transparent" height={96} width={'auto'}>
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100} fontSize={38}>
                    Solver infrastructure
                  </TopicTitle>
                  <TopicDescription fontSize={21} color="#F996EE">
                    CoW Protocol maintains the most robust network of solvers in DeFi, with more being added every day.
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#66018E" textColor="#F996EE" padding={'32px'} asProp="div">
                <TopicImage iconColor="#8702AA" bgColor="transparent" height={96} width={'auto'}>
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100} fontSize={38}>
                    Rebalancing portfolios
                  </TopicTitle>
                  <TopicDescription fontSize={21} color="#F996EE">
                    Info about rebalancing portfolios goes here. Info about rebalancing portfolios goes here.
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={Color.neutral10} color={Color.neutral98}>
          <ContainerCardSection>
            <SectionTitleWrapper padding="150px 0 0">
              <SectionTitleIcon multiple>
                <SVG src={IMG_ICON_OWL} />
                <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly height={60} />
                <SVG src={IMG_ICON_GHOST} />
              </SectionTitleIcon>
              <SectionTitleText fontSize={90}>Trusted by the best</SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={3}>
              <TopicCard contentAlign={'center'} bgColor={Color.neutral98} padding={'42px'} href="/">
                <TopicImage
                  iconColor={Color.neutral20}
                  bgColor={'transparent'}
                  width={'100%'}
                  height={54}
                  margin={'auto'}
                >
                  <SVG src={IMG_LOGO_SAFE} />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'center'} bgColor={Color.neutral98} padding={'42px'} href="/">
                <TopicImage
                  iconColor={Color.neutral20}
                  bgColor={'transparent'}
                  width={'100%'}
                  height={54}
                  margin={'auto'}
                >
                  <SVG src={IMG_LOGO_OASIS} />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'center'} bgColor={Color.neutral98} padding={'42px'} href="/">
                <TopicImage
                  iconColor={Color.neutral20}
                  bgColor={'transparent'}
                  width={'100%'}
                  height={54}
                  margin={'auto'}
                >
                  <SVG src={IMG_LOGO_SAFE} />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'center'} bgColor={Color.neutral98} padding={'42px'} gap={12} asProp="div">
                <TopicImage iconColor="#8702AA" bgColor={'transparent'} height={128}>
                  <SVG src={IMG_ICON_OWL} />
                </TopicImage>
                <TopicCardInner contentAlign="center">
                  <TopicTitle fontSize={51}>Yearn</TopicTitle>
                  <TopicDescription fontSize={21}>
                    Aave DAO used CoW Swap to swap over $4 million directly into Balancer liquidity pool
                  </TopicDescription>
                  <TopicButton bgColor="#490072" color="#F996EE">
                    Learn more
                  </TopicButton>
                </TopicCardInner>
              </TopicCard>

              <TopicCard contentAlign={'center'} bgColor={Color.neutral98} padding={'42px'} gap={12} asProp="div">
                <TopicImage iconColor="#8702AA" bgColor={'transparent'} height={128}>
                  <SVG src={IMG_ICON_GHOST} />
                </TopicImage>
                <TopicCardInner contentAlign="center">
                  <TopicTitle fontSize={51}>Giveth</TopicTitle>
                  <TopicDescription fontSize={21}>
                    Aave DAO used CoW Swap to swap over $4 million directly into Balancer liquidity pool
                  </TopicDescription>
                  <TopicButton bgColor="#490072" color="#F996EE">
                    Learn more
                  </TopicButton>
                </TopicCardInner>
              </TopicCard>

              <TopicCard contentAlign={'center'} bgColor={Color.neutral98} padding={'42px'} gap={12} asProp="div">
                <TopicImage iconColor="#8702AA" bgColor={'transparent'} height={128}>
                  <SVG src={IMG_ICON_GHOST} />
                </TopicImage>
                <TopicCardInner contentAlign="center">
                  <TopicTitle fontSize={51}>Balancer</TopicTitle>
                  <TopicDescription fontSize={21}>
                    Aave DAO used CoW Swap to swap over $4 million directly into Balancer liquidity pool
                  </TopicDescription>
                  <TopicButton bgColor="#490072" color="#F996EE">
                    Learn more
                  </TopicButton>
                </TopicCardInner>
              </TopicCard>

              <TopicCard contentAlign={'center'} bgColor={Color.neutral98} padding={'42px'} href="/">
                <TopicImage
                  iconColor={Color.neutral20}
                  bgColor={'transparent'}
                  width={'100%'}
                  height={54}
                  margin={'auto'}
                >
                  <SVG src={IMG_LOGO_SAFE} />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'center'} bgColor={Color.neutral98} padding={'42px'} href="/">
                <TopicImage
                  iconColor={Color.neutral20}
                  bgColor={'transparent'}
                  width={'100%'}
                  height={54}
                  margin={'auto'}
                >
                  <SVG src={IMG_LOGO_OASIS} />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'center'} bgColor={Color.neutral98} padding={'42px'} href="/">
                <TopicImage
                  iconColor={Color.neutral20}
                  bgColor={'transparent'}
                  width={'100%'}
                  height={54}
                  margin={'auto'}
                >
                  <SVG src={IMG_LOGO_SAFE} />
                </TopicImage>
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'}>
          <ContainerCardSection>
            <SectionTitleWrapper color={Color.neutral10} maxWidth={1100}>
              <SectionTitleIcon size={114}>
                <SVG src={IMG_ICON_BUILD_WITH_COW} />
              </SectionTitleIcon>
              <SectionTitleText>Build with CoW Protocol</SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={2}>
              <TopicCard contentAlign={'left'} bgColor="#66018E" textColor="#F996EE" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={38} color={Color.neutral100}>
                    For developers
                  </TopicTitle>
                  <TopicDescription fontSize={21} color="#F996EE">
                    As an open-source protocol, building on top of CoW Protocol is permissionless. Thanks to
                    comprehensive documentation and even a live coding environment, integrating the protocol is easy.
                  </TopicDescription>
                  <TopicButton bgColor="#ED60E9" color="#66018E" fontSize={27}>
                    Read the docs
                  </TopicButton>
                </TopicCardInner>
                <TopicImage iconColor="#8702AA" bgColor="transparent" margin={'0 0 0 auto'} height={187} width={'auto'}>
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#66018E" textColor="#F996EE" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={38} color={Color.neutral100}>
                    For DeFi projects
                  </TopicTitle>
                  <TopicDescription fontSize={21} color="#F996EE">
                    The worry-free DEX can power swaps and intent-based transactions for any DeFi project or use-case.
                  </TopicDescription>
                  <TopicButton bgColor="#ED60E9" color="#66018E" fontSize={27}>
                    Read the docs
                  </TopicButton>
                </TopicCardInner>
                <TopicImage iconColor="#8702AA" bgColor="transparent" margin={'0 0 0 auto'} height={187} width={'auto'}>
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#66018E" textColor="#F996EE" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={38} color={Color.neutral100}>
                    For dummies
                  </TopicTitle>
                  <TopicDescription fontSize={21} color="#F996EE">
                    Want to bring the most advanced swap features in DeFi directly to your website, dApp, or project?
                  </TopicDescription>
                  <TopicButton bgColor="#ED60E9" color="#66018E" fontSize={27}>
                    Integrate the widget
                  </TopicButton>
                </TopicCardInner>
                <TopicImage iconColor="#8702AA" bgColor="transparent" margin={'0 0 0 auto'} height={187} width={'auto'}>
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#66018E" textColor="#F996EE" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={38} color={Color.neutral100}>
                    For anyone
                  </TopicTitle>
                  <TopicDescription fontSize={21} color="#F996EE">
                    The CoW Grants program has given out over $100,000 to community contributors and to innovative
                    projects built on top of CoW Protocol.
                  </TopicDescription>
                  <TopicButton bgColor="#ED60E9" color="#66018E" fontSize={27}>
                    Apply for a grant
                  </TopicButton>
                </TopicCardInner>
                <TopicImage iconColor="#8702AA" bgColor="transparent" margin={'0 0 0 auto'} height={187} width={'auto'}>
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'}>
          <ContainerCardSection>
            <SectionTitleWrapper>
              <SectionTitleIcon size={100}>
                <SVG src={IMG_ICON_SECURE} />
              </SectionTitleIcon>
              <SectionTitleText fontSize={90} textAlign="center">
                Secure & battle-tested
              </SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={3}>
              <TopicCard bgColor="#66018E" textColor={Color.neutral100} href="/">
                <TopicImage iconColor="#F996EE" large></TopicImage>
                <TopicTitle fontSize={38}>Programmatic orders</TopicTitle>
              </TopicCard>

              <TopicCard bgColor="#66018E" textColor={Color.neutral100} href="/">
                <TopicImage iconColor="#F996EE" large></TopicImage>
                <TopicTitle fontSize={38}>CoW Hooks</TopicTitle>
              </TopicCard>

              <TopicCard bgColor="#66018E" textColor={Color.neutral100} href="/">
                <TopicImage iconColor="#F996EE" large></TopicImage>
                <TopicTitle fontSize={38}>Smart orders</TopicTitle>
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
