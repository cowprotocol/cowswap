'use client'

import type { ReactNode } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { CHAIN_INFO_ARRAY, SOLANA_ALPHA_MAX_TRADE_SIZE_USD_DISPLAY } from '@cowprotocol/common-const'
import { Media, ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import { CowFiCategory } from 'src/common/analytics/types'
import styled, { keyframes } from 'styled-components/macro'

import LazySVG from '@/components/LazySVG'
import { Link, LinkType } from '@/components/Link'
import { Reveal } from '@/components/Reveal'
import {
  PageWrapper,
  ContainerCard,
  ContainerCardSection,
  TopicList,
  TopicCard,
  TopicImage,
  TopicTitle,
  TopicDescription,
  SectionTitleWrapper,
  SectionTitleIcon,
  SectionTitleText,
  SectionTitleDescription,
  TopicCardInner,
  HeroContainer,
  HeroDescription,
  HeroContent,
  HeroTitle,
  HeroSubtitle,
  HeroImage,
  HeroButtonWrapper,
} from '@/styles/styled'

const SOLANA_INFO = CHAIN_INFO_ARRAY.find(({ name }) => name === 'solana')
const SOLANA_SWAP_URL = 'https://swap.cow.fi/#/1000000001/swap'
const DOCS_URL = 'https://docs.cow.fi/'

const float = keyframes`
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }

  50% {
    transform: translate3d(0, -1.6rem, 0);
  }
`

const FloatingHeroImage = styled(HeroImage)`
  animation: ${float} 6s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const SolanaPageWrapper = styled(PageWrapper)`
  overflow-x: clip;
`

const RevealList = styled(TopicList)`
  overflow: visible;
`

const FeatureCard = styled(TopicCard)`
  ${Media.upToMedium()} {
    flex-flow: row nowrap;
    align-items: center;
    gap: 1.2rem;

    > :first-child {
      flex: 0 0 auto;
    }
  }
`

const CtaSection = styled(ContainerCardSection)`
  ${Media.upToMedium()} {
    padding-bottom: 1.6rem;
  }
`

const FEATURE_ITEMS = [
  'Market and limit orders',
  'SPL and Token-2022 tokens',
  'Native SOL buys, wrap and unwrap',
  'Import any token by its mint address',
  'Order cancellation',
  'Order tracking in CoW Explorer',
  'Solana wallets and WalletConnect',
  'One interface for EVM chains and Solana',
]

const BENEFITS = [
  {
    icon: 'images/protection.svg',
    title: 'Protection from MEV',
    description:
      'Orders are settled in batches by solvers, not sent straight to the public mempool. Sandwich bots have nothing to front-run',
  },
  {
    icon: 'images/surplus.svg',
    title: 'Surplus-capturing orders',
    description:
      'Solvers compete to find the best execution for every order. If they beat your quote, the extra goes back to you',
  },
  {
    icon: 'images/gasless.svg',
    title: 'Sponsored fees',
    description:
      'Network fees are covered for eligible orders, so you can trade without topping up SOL for every transaction',
  },
]

export default function Page(): ReactNode {
  return (
    <SolanaPageWrapper>
      <HeroContainer variant="secondary">
        <HeroContent variant="secondary">
          <HeroSubtitle color={'#9945FF'}>Solana</HeroSubtitle>
          <HeroTitle fontSize={52} fontSizeMobile={38}>
            CoW Swap, now on Solana
          </HeroTitle>
          <HeroDescription color={`var(${UI.COLOR_NEUTRAL_30})`}>
            Intents, batch auctions and solver competition come to Solana. Trade SPL tokens with the same MEV protection
            and surplus-capturing execution that CoW Swap traders rely on across Ethereum and other EVM chains
          </HeroDescription>

          <HeroButtonWrapper>
            <CtaButtons utmPrefix="solana-page-hero" />
          </HeroButtonWrapper>
        </HeroContent>

        {SOLANA_INFO && (
          <FloatingHeroImage width={360} height={360} widthMobile={240} heightMobile={240}>
            <img src={SOLANA_INFO.logo.light} alt={SOLANA_INFO.label} width="100%" height="100%" />
          </FloatingHeroImage>
        )}
      </HeroContainer>

      <HowItWorksSection />

      <BenefitsSection />

      <FeaturesSection />

      <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_90})`} color={`var(${UI.COLOR_NEUTRAL_10})`} touchFooter>
        <CtaSection padding={'0 0 100px'}>
          <Reveal>
            <SectionTitleWrapper marginMobile="5.6rem auto 0">
              <SectionTitleIcon>
                <ProductLogo variant={ProductVariant.CowSwap} theme="light" logoIconOnly />
              </SectionTitleIcon>
              <SectionTitleText>Start trading on Solana</SectionTitleText>
              <HeroButtonWrapper width="auto">
                <CtaButtons utmPrefix="solana-page-bottom" />
              </HeroButtonWrapper>
            </SectionTitleWrapper>
          </Reveal>
        </CtaSection>
      </ContainerCard>

      <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_90})`} color={`var(${UI.COLOR_NEUTRAL_10})`} touchFooter>
        <ContainerCardSection padding={'0'}>
          <Reveal>
            <SectionTitleWrapper maxWidth={1000} margin="0 auto" marginMobile="0 auto">
              <SectionTitleDescription fontSize={16} color={`var(${UI.COLOR_NEUTRAL_40})`}>
                <b>Solana Alpha · Unaudited:</b> CoW Swap on Solana is in Alpha. This deployment has not yet been
                independently audited and may contain bugs, vulnerabilities or unexpected behaviour that could result in
                failed transactions or partial or total loss of assets. Maximum trade size is $
                {SOLANA_ALPHA_MAX_TRADE_SIZE_USD_DISPLAY} per order
              </SectionTitleDescription>
            </SectionTitleWrapper>
          </Reveal>
        </ContainerCardSection>
      </ContainerCard>
    </SolanaPageWrapper>
  )
}

function BenefitsSection(): ReactNode {
  return (
    <ContainerCard bgColor={'transparent'} color={`var(${UI.COLOR_NEUTRAL_10})`}>
      <ContainerCardSection>
        <Reveal>
          <SectionTitleWrapper maxWidth={900}>
            <SectionTitleIcon $size={60}>
              <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly />
            </SectionTitleIcon>
            <SectionTitleText fontSize={62}>The CoW Swap edge, on Solana</SectionTitleText>
            <SectionTitleDescription fontSize={24} color={`var(${UI.COLOR_NEUTRAL_40})`}>
              Everything that makes CoW Swap different, now available to Solana traders
            </SectionTitleDescription>
          </SectionTitleWrapper>
        </Reveal>

        <RevealList columns={3} columnsTablet={2}>
          {BENEFITS.map(({ icon, title, description }, index) => (
            <Reveal key={title} delay={index * 150} isFullHeight>
              <TopicCard
                height="100%"
                contentAlign={'left'}
                bgColor={`var(${UI.COLOR_NEUTRAL_100})`}
                padding={'32px'}
                gap={16}
                asProp="div"
              >
                <TopicImage bgColor="transparent" height={75} width={'auto'}>
                  <LazySVG src={icon} />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicTitle>{title}</TopicTitle>
                  <TopicDescription fontSize={18} color={`var(${UI.COLOR_NEUTRAL_40})`} margin="0">
                    {description}
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>
            </Reveal>
          ))}
        </RevealList>
      </ContainerCardSection>
    </ContainerCard>
  )
}

function CtaButtons({ utmPrefix }: { utmPrefix: string }): ReactNode {
  const analytics = useCowAnalytics()

  return (
    <>
      <Link
        href={SOLANA_SWAP_URL}
        utmContent={`${utmPrefix}-trade-on-solana`}
        external
        linkType={LinkType.HeroButton}
        onClick={() =>
          analytics.sendEvent({
            category: CowFiCategory.SOLANA,
            action: 'click-trade-on-solana',
          })
        }
      >
        Trade on Solana
      </Link>

      <Link
        bgColor="transparent"
        color={`var(${UI.COLOR_NEUTRAL_20})`}
        href={DOCS_URL}
        utmContent={`${utmPrefix}-read-docs`}
        external
        linkType={LinkType.HeroButton}
        onClick={() =>
          analytics.sendEvent({
            category: CowFiCategory.SOLANA,
            action: 'click-read-docs',
          })
        }
      >
        Read docs
      </Link>
    </>
  )
}

function FeaturesSection(): ReactNode {
  return (
    <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_100})`} color={`var(${UI.COLOR_NEUTRAL_10})`}>
      <ContainerCardSection>
        <Reveal>
          <SectionTitleWrapper maxWidth={900}>
            <SectionTitleIcon $size={60}>
              <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly />
            </SectionTitleIcon>
            <SectionTitleText fontSize={62}>What you can do today</SectionTitleText>
          </SectionTitleWrapper>
        </Reveal>

        <RevealList columns={4} columnsTablet={2} columnsMobile={1} gapMobile={8}>
          {FEATURE_ITEMS.map((item, index) => (
            <Reveal key={item} delay={(index % 4) * 100} isFullHeight>
              <FeatureCard
                height="100%"
                contentAlign={'left'}
                bgColor={`var(${UI.COLOR_NEUTRAL_90})`}
                padding={'24px'}
                paddingMobile={'16px'}
                gap={12}
                asProp="div"
              >
                <TopicImage
                  bgColor="transparent"
                  height={42}
                  heightMobile={28}
                  width={'auto'}
                  widthMobile={28}
                  marginMobile="0"
                >
                  <LazySVG src="images/icons/check-color.svg" />
                </TopicImage>
                <TopicCardInner contentAlign="left" contentAlignMobile="left">
                  <TopicTitle fontSize={23} fontSizeMobile={18} fontWeight={`var(${UI.FONT_WEIGHT_MEDIUM})`}>
                    {item}
                  </TopicTitle>
                </TopicCardInner>
              </FeatureCard>
            </Reveal>
          ))}
        </RevealList>
      </ContainerCardSection>
    </ContainerCard>
  )
}

function HowItWorksSection(): ReactNode {
  return (
    <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_10})`} color={`var(${UI.COLOR_NEUTRAL_100})`}>
      <ContainerCardSection>
        <Reveal>
          <SectionTitleWrapper>
            <SectionTitleIcon $size={100}>
              <ProductLogo variant={ProductVariant.CowProtocol} theme="light" logoIconOnly />
            </SectionTitleIcon>
            <SectionTitleText>How it works</SectionTitleText>
          </SectionTitleWrapper>
        </Reveal>

        <RevealList columns={1} columnsTablet={1} maxWidth={1000}>
          <Reveal direction="left">
            <TopicCard
              columns="1fr auto"
              gap={48}
              padding={'24px 0'}
              horizontal
              asProp="div"
              bgColor={'transparent'}
              textColor={`var(${UI.COLOR_NEUTRAL_100})`}
            >
              <TopicCardInner contentAlign="left">
                <TopicTitle fontSize={48}>Sign an intent, not a route</TopicTitle>
                <TopicDescription fontSize={24} color={`var(${UI.COLOR_NEUTRAL_80})`}>
                  Tell CoW Swap what you want to trade and the minimum you accept. Solvers do the work of finding the
                  best path across Solana liquidity
                </TopicDescription>
              </TopicCardInner>
              <TopicImage width={340} height={240} heightMobile={214} orderReverseMobile bgColor="transparent">
                <img src="images/eth-circles.svg" alt="Sign an intent" width="340" height="214" />
              </TopicImage>
            </TopicCard>
          </Reveal>

          <Reveal direction="right">
            <TopicCard
              columns="1fr auto"
              gap={48}
              padding={'24px 0'}
              horizontal
              asProp="div"
              bgColor="transparent"
              textColor={`var(${UI.COLOR_NEUTRAL_100})`}
            >
              <TopicImage width={340} height={240} heightMobile={214} orderReverseMobile bgColor="transparent">
                <img src="images/eth-blocks.svg" alt="Batch auctions" width="340" height="214" loading="lazy" />
              </TopicImage>
              <TopicCardInner contentAlign="left">
                <TopicTitle fontSize={48}>Settled in batch auctions</TopicTitle>
                <TopicDescription fontSize={24} color={`var(${UI.COLOR_NEUTRAL_80})`}>
                  Orders are grouped into batches and settled by the solver offering the best outcome. Matching orders
                  can trade directly peer-to-peer, without touching an AMM at all
                </TopicDescription>
              </TopicCardInner>
            </TopicCard>
          </Reveal>
        </RevealList>
      </ContainerCardSection>
    </ContainerCard>
  )
}
