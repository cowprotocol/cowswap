import { GetStaticProps } from 'next'
import { Color, ProductLogo, ProductVariant } from '@cowprotocol/ui'
import IMG_ICON_CROWN_COW from '@cowprotocol/assets/images/icon-crown-cow.svg'
import IMG_ICON_GOVERNANCE from '@cowprotocol/assets/images/icon-governance.svg'
import IMG_ICON_BULB_COW from '@cowprotocol/assets/images/icon-bulb-cow.svg'
import IMG_ICON_BUILD_WITH_COW from '@cowprotocol/assets/images/icon-build-with-cow.svg'
import IMG_ICON_SECURE from '@cowprotocol/assets/images/icon-secure.svg'
import IMG_ICON_OWL from '@cowprotocol/assets/images/icon-owl.svg'
import IMG_ICON_GHOST from '@cowprotocol/assets/images/icon-ghost.svg'
import IMG_LOGO_SAFE from '@cowprotocol/assets/images/logo-safe.svg'
import IMG_LOGO_SUMMER_FI from '@cowprotocol/assets/images/logo-summer-fi.svg'
import IMG_LOGO_LIDO from '@cowprotocol/assets/images/logo-lido.svg'
import IMG_LOGO_CURVE from '@cowprotocol/assets/images/logo-curve.svg'

import styled from 'styled-components'

import { CONFIG } from '@/const/meta'

import Layout from '@/components/Layout'
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
  --maxWidth: 1760px;
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  max-width: var(--maxWidth);
  width: 100%;
  margin: 76px auto 0;
  gap: 24px;
`

export default function Page({ siteConfigData }: PageProps) {
  return (
    <Layout
      bgColor={Color.neutral90}
      metaTitle="CoW Protocol - Do what you want, build what you want"
      metaDescription="CoW Protocol has the largest solver competition and the most advanced developer framework - so you can build any DEX-related action you can imagine"
    >
      <Wrapper>
        <HeroContainer variant="secondary" maxWidth={1300}>
          <HeroContent variant="secondary">
            <HeroSubtitle color={'#66018E'}>CoW Protocol</HeroSubtitle>
            <HeroTitle maxWidth={520}>Do what you want, build what you want</HeroTitle>
            <HeroDescription>
              CoW Protocol has the largest solver competition and the most advanced developer framework - so you can
              build any DEX-related action you can imagine
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
            <h2>23</h2>
            <p>active solvers settling batches</p>
          </MetricsItem>
          <MetricsItem dividerColor="#ED60E9">
            <h2>25%</h2>
            <p>of Ethereum's non-toxic DEX volume originates on CoW Protocol</p>
          </MetricsItem>
          <MetricsItem dividerColor="#ED60E9">
            <h2>#1</h2>
            <p>intent-based DEX protocol by volume</p>
          </MetricsItem>

          <SectionTitleButton
            bgColor="transparent"
            color="#66018E"
            margin="24px auto 0"
            gridFullWidth
            href="https://dune.com/cowprotocol/monthly-cow-protocol-reporting"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            View all metrics on DUNE &#8599;
          </SectionTitleButton>
        </MetricsCard>

        <ContainerCard bgColor={Color.neutral98}>
          <ContainerCardSection>
            <SectionTitleWrapper color={Color.neutral0} maxWidth={700} gap={56}>
              <SectionTitleIcon size={82}>
                <SVG src={IMG_ICON_CROWN_COW} />
              </SectionTitleIcon>
              <SectionTitleText>The leading intents-based DEX aggregation protocol</SectionTitleText>
              <SectionTitleDescription maxWidth={900} color={Color.neutral50}>
                CoW Protocol leverages intents, the largest solver network in DeFi, and batch auctions to bring
                surplus-capturing, MEV-protected trades to users
              </SectionTitleDescription>
            </SectionTitleWrapper>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'}>
          <ContainerCardSection>
            <SectionTitleWrapper>
              <SectionTitleIcon size={82}>
                <ProductLogo variant={ProductVariant.CowProtocol} theme="light" logoIconOnly />
              </SectionTitleIcon>
              <SectionTitleText>How it works</SectionTitleText>
              <SectionTitleDescription maxWidth={900} color={Color.neutral50}>
                By leveraging intents, the largest solver network, and batch auctions, CoW Protocol hosts a continuous
                competition between solvers to find better prices and protect users from MEV
              </SectionTitleDescription>
            </SectionTitleWrapper>

            <TopicList columns={1} maxWidth={1470}>
              <TopicCard columns="1fr auto" gap={100} horizontal asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={51}>Intents</TopicTitle>
                  <TopicDescription fontSize={28} color={Color.neutral50}>
                    CoW Protocol users sign an "intent to trade" message instead of directly executing orders on-chain
                    (like on Uniswap). This lets solvers trade on behalf of the user.
                  </TopicDescription>
                  <TopicButton bgColor="#66018E" color="#F996EE" href="/learn">
                    Learn more
                  </TopicButton>
                </TopicCardInner>
                <TopicImage iconColor="#66018E" width={590} height={590} heightMobile={300} orderReverseMobile />
              </TopicCard>

              <TopicCard columns="1fr auto" gap={100} horizontal asProp="div">
                <TopicImage iconColor="#66018E" width={590} height={590} heightMobile={300} orderReverseMobile />
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={51}>Solvers</TopicTitle>
                  <TopicDescription fontSize={28} color={Color.neutral50}>
                    Professional third parties known as solvers find the most optimal trade path from a combination of
                    public and private liquidity sources - finding better prices than most users could find on their
                    own.
                  </TopicDescription>
                  <TopicButton bgColor="#66018E" color="#F996EE" href="/learn">
                    Learn more
                  </TopicButton>
                </TopicCardInner>
              </TopicCard>

              <TopicCard columns="1fr auto" gap={100} horizontal asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={51}>Batch Auctions</TopicTitle>
                  <TopicDescription fontSize={28} color={Color.neutral50}>
                    Solvers compete for the right to settle trades in batches, which give users additional MEV
                    protection and allow for Coincidence of Wants.
                    <br />
                    <br />
                    The solver that wins the batch auction is the solver that finds the most surplus - so they win when
                    you win.
                  </TopicDescription>
                  <TopicButton bgColor="#66018E" color="#F996EE" href="/learn">
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
              <SectionTitleText>Going where others can&apos;t</SectionTitleText>
              <SectionTitleDescription color={Color.neutral60}>
                Thanks to its unique architecture, CoW Protocol can do things other DEXs can&apos;t
              </SectionTitleDescription>
            </SectionTitleWrapper>

            <SectionTitleWrapper padding="50px 0">
              <SectionTitleText>Advanced order types</SectionTitleText>
            </SectionTitleWrapper>
            <TopicList columns={3}>
              <TopicCard contentAlign={'left'} bgColor="#66018E" textColor="#F996EE" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100}>Limit orders</TopicTitle>
                  <TopicDescription fontSize={21} color="#F996EE">
                    Placing a limit order is like setting a trap for a price for your trade. CoW Swap is the only DEX
                    that offers surplus on limit orders - and one of the only DEXs that offers limit orders at all.
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
                    Time-weighted average price (TWAP) orders minimize price impact and volatility risk by letting you
                    trade assets at fixed intervals over a period of time.
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
                    Created with our friends at Yearn.fi, Milkman orders let you prep a trade today to be executed in
                    the future - with the help of a price oracle so you don't get rekt.
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
              <SectionTitleText textAlign="center">Unique trading logic</SectionTitleText>
            </SectionTitleWrapper>
            <TopicList columns={3}>
              <TopicCard contentAlign={'left'} bgColor="#66018E" textColor="#F996EE" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100}>Smart orders</TopicTitle>
                  <TopicDescription fontSize={21} color="#F996EE">
                    ERC-1271 smart orders let you custom code any trading logic
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
                  <TopicTitle color={Color.neutral100}>Programmatic Orders</TopicTitle>
                  <TopicDescription fontSize={21} color="#F996EE">
                    Easily deploy conditional orders that trigger when specified on-chain conditions are met
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
                  <TopicTitle color={Color.neutral100}>Hooks</TopicTitle>
                  <TopicDescription fontSize={21} color="#F996EE">
                    Add pre- and post- hooks to tie your trade to any other DeFi activity (bridging, staking,
                    depositing, etc.)
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
              <SectionTitleText textAlign="center">Powering innovation across DeFi</SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={3}>
              <TopicCard contentAlign={'left'} bgColor="#66018E" textColor="#F996EE" padding={'32px'} asProp="div">
                <TopicImage iconColor="#8702AA" bgColor="transparent" height={96} width={'auto'}>
                  <SVG src={IMG_LOGO_CURVE} />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100} fontSize={38}>
                    Automating advanced treasury tasks
                  </TopicTitle>
                  <TopicDescription fontSize={21} color="#F996EE">
                    Curve uses programmatic orders from CoW Protocol to streamline their fee burning processes. With the
                    integration in place, Curve can take fees in any token and convert them automatically to CRV, while
                    generating surplus and protecting themselves from MEV
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#66018E" textColor="#F996EE" padding={'32px'} asProp="div">
                <TopicImage iconColor="#8702AA" bgColor="transparent" height={96} width={'auto'}>
                  <SVG src={IMG_LOGO_LIDO} />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100} fontSize={38}>
                    Adding security to sensitive transactions
                  </TopicTitle>
                  <TopicDescription fontSize={21} color="#F996EE">
                    Lido leverages programmatic orders as the backbone of “stonks” - a set of smart contracts that they
                    use to manage treasury ops smoothly and securely without taking custody of funds. Stonks allows Lido
                    DAO to "set and forget" complex trade intents without compromising the prices they receive on future
                    swaps - minimizing time spend and human error
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#66018E" textColor="#F996EE" padding={'32px'} asProp="div">
                <TopicImage iconColor="#8702AA" bgColor="transparent" height={96} width={'auto'}>
                  <SVG src={IMG_LOGO_SAFE} />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100} fontSize={38}>
                    Powering native swaps
                  </TopicTitle>
                  <TopicDescription fontSize={21} color="#F996EE">
                    Safe chose CoW Protocol to power native swaps on the Safe app. The team chose to build on top of the
                    CoW widget (the simplest way to integrate CoW Protocol) and is now earning revenue by offering
                    MEV-protected swaps to its users
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
              <SectionTitleText>Trusted by the best</SectionTitleText>
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
                  <SVG src={IMG_LOGO_SUMMER_FI} />
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
                  <SVG src={IMG_LOGO_SUMMER_FI} />
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

            <TopicList columns={3}>
              <TopicCard contentAlign={'left'} bgColor="#66018E" textColor="#F996EE" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={38} color={Color.neutral100}>
                    For developers
                  </TopicTitle>
                  <TopicDescription fontSize={21} color="#F996EE" minHeight={170}>
                    As an open-source protocol, building on top of CoW Protocol is permissionless. Thanks to
                    comprehensive documentation and live coding tutorials, integrating the protocol is easy
                  </TopicDescription>
                  <TopicButton
                    bgColor="#ED60E9"
                    color="#66018E"
                    fontSize={27}
                    href="https://docs.cow.fi/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
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
                  <TopicDescription fontSize={21} color="#F996EE" minHeight={170}>
                    Don't need overly-custom trading logic? The CoW Protocol widget is the easiest way to integrate
                    swaps, twaps, and limit orders directly into your project site
                  </TopicDescription>
                  <TopicButton bgColor="#ED60E9" color="#66018E" fontSize={27} href="/widget">
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
                  <TopicDescription fontSize={21} color="#F996EE" minHeight={170}>
                    The CoW DAO Grants program has awarded over $100,000 in grants to innovators that build public DeFi
                    applications with CoW Protocol
                  </TopicDescription>
                  <TopicButton
                    bgColor="#ED60E9"
                    color="#66018E"
                    fontSize={27}
                    href="https://grants.cow.fi/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
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
            <SectionTitleWrapper maxWidth={1000}>
              <SectionTitleIcon size={100}>
                <SVG src={IMG_ICON_SECURE} />
              </SectionTitleIcon>
              <SectionTitleText textAlign="center">Want to build a solver?</SectionTitleText>
              <SectionTitleDescription fontSize={28} color={Color.neutral30}>
                Solvers are the backbone of CoW Protocol. In a nutshell, solvers are optimization algorithms that
                compete to find CoW Protocol users the best possible settlements for their trade intents.
                <br />
                <br />
                Advanced solver teams can earn hundreds of thousands of dollars per year by winning batch auctions
                frequently.
                <br />
                <br />
                Learn more about building a solver by reading the CoW Protocol docs.
              </SectionTitleDescription>

              <SectionTitleButton
                bgColor="#66018E"
                color="#F996EE"
                href="https://docs.cow.fi/cow-protocol/tutorials/solvers"
                target="_blank"
                rel="noopener noreferrer nofollow"
                margin="28px 0 0"
              >
                Read the docs
              </SectionTitleButton>
            </SectionTitleWrapper>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={Color.neutral90} color={Color.neutral10} touchFooter>
          <ContainerCardSection>
            <SectionTitleWrapper>
              <SectionTitleIcon size={62}>
                <SVG src={IMG_ICON_FAQ} />
              </SectionTitleIcon>
              <SectionTitleText>FAQs</SectionTitleText>
            </SectionTitleWrapper>

            <FAQ faqs={FAQ_DATA} />
          </ContainerCardSection>
        </ContainerCard>
      </Wrapper>
    </Layout>
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
