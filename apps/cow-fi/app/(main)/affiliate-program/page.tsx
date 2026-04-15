'use client'
import type { ReactNode } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import IMG_ICON_COW_LENS from '@cowprotocol/assets/images/icon-cow-lens.svg'
import IMG_ICON_FAQ from '@cowprotocol/assets/images/icon-faq.svg'
import IMG_COWSWAP_HERO from '@cowprotocol/assets/images/image-affiliate-hero.svg'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { Media, ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import { CowFiCategory } from 'src/common/analytics/types'
import styled from 'styled-components/macro'

import FAQ from '@/components/FAQ'
import LazySVG from '@/components/LazySVG'
import { Link, LinkType } from '@/components/Link'
import { NotFoundPageComponent } from '@/components/NotFoundPageComponent'
import {
  AFFILIATE_PROGRAM_CTA,
  AFFILIATE_PROGRAM_DOCS_CTA,
  AFFILIATE_PROGRAM_METRICS,
  AFFILIATE_PROGRAM_STEPS,
  getAffiliateProgramFaq,
} from '@/data/affiliate-program/const'
import {
  ContainerCard,
  ContainerCardSection,
  HeroContainer,
  HeroContent,
  HeroDescription,
  HeroImage,
  HeroSubtitle,
  HeroTitle,
  PageWrapper,
  SectionTitleDescription,
  SectionTitleIcon,
  SectionTitleText,
  SectionTitleWrapper,
  TopicCard,
  TopicCardInner,
  TopicDescription,
  TopicImage,
  TopicList,
  TopicTitle,
} from '@/styles/styled'

const FooterCtaLinkOuter = styled.div`
  ${Media.upToExtraSmall()} {
    width: 100%;
    box-sizing: border-box;
    align-self: stretch;
    margin: 0;

    a {
      display: block;
      width: 100%;
      box-sizing: border-box;
      line-height: 1.35;
      padding: 14px 16px;
    }
  }
`

type SendEvent = (action: string) => void
function AffiliateHero({ sendEvent }: { sendEvent: SendEvent }): ReactNode {
  return (
    <HeroContainer variant="secondary" minHeight="40vh">
      <HeroContent variant="secondary">
        <HeroSubtitle color={`var(${UI.COLOR_YELLOW_700_PRIMARY})`}>Affiliate Program</HeroSubtitle>
        <HeroTitle>Moo &amp; Earn</HeroTitle>
        <HeroDescription color={`var(${UI.COLOR_NEUTRAL_30})`}>
          Turn your influence into income. Share CoW Swap with your audience and earn rewards every time they trade.
          <br />
          No gatekeepers. No approval. Just your link - and the moos.
        </HeroDescription>
        <Link
          bgColor={`var(${UI.COLOR_YELLOW_800_PRIMARY})`}
          color={`var(${UI.COLOR_YELLOW_300_PRIMARY})`}
          href={AFFILIATE_PROGRAM_CTA.href}
          external
          linkType={LinkType.HeroButton}
          utmContent={AFFILIATE_PROGRAM_CTA.utmContent}
          onClick={() => sendEvent(AFFILIATE_PROGRAM_CTA.action)}
        >
          {AFFILIATE_PROGRAM_CTA.text}
        </Link>
      </HeroContent>
      <HeroImage
        width={470}
        height={470}
        widthMobile="100%"
        heightMobile={300}
        color={`var(${UI.COLOR_BLUE_900_PRIMARY})`}
        marginMobile="24px auto 56px"
      >
        <LazySVG src={IMG_COWSWAP_HERO} />
      </HeroImage>
    </HeroContainer>
  )
}
function HowItWorksSection(): ReactNode {
  return (
    <ContainerCard
      bgColor={`var(${UI.COLOR_NEUTRAL_10})`}
      color={`var(${UI.COLOR_NEUTRAL_100})`}
      padding="12rem 6rem 6rem"
    >
      <ContainerCardSection gap={64}>
        <SectionTitleWrapper color={`var(${UI.COLOR_NEUTRAL_100})`} margin="0 auto" gap={64}>
          <SectionTitleIcon $multiple $size={110}>
            <LazySVG src={IMG_ICON_COW_LENS} style={{ filter: 'brightness(0) saturate(100%) invert(100%)' }} />
          </SectionTitleIcon>
          <SectionTitleText>The more you moo, the more you earn</SectionTitleText>
          <SectionTitleDescription color={`var(${UI.COLOR_NEUTRAL_70})`} fontSize={30} maxWidth={760}>
            Share CoW Swap with your community and earn USDC rewards when they hit volume milestones. It&apos;s
            permissionless, transparent, and built for the people who move markets.
          </SectionTitleDescription>
        </SectionTitleWrapper>
        <SectionTitleWrapper color={`var(${UI.COLOR_NEUTRAL_100})`} margin="6.4rem auto 1.6rem" gap={0}>
          <SectionTitleText fontSize={42} fontSizeMobile={32}>
            How it works
          </SectionTitleText>
        </SectionTitleWrapper>
        <TopicList columns={3} columnsTablet={2} gap={24}>
          {AFFILIATE_PROGRAM_STEPS.map((step) => (
            <TopicCard
              key={step.title}
              contentAlign="left"
              bgColor={step.bgColor}
              textColor={step.textColor}
              padding="24px"
              asProp="div"
              height="100%"
            >
              <TopicCardInner contentAlign="left" height="100%" gap={24}>
                <TopicTitle fontSize={28} color={step.textColor}>
                  {step.title}
                </TopicTitle>
                <TopicDescription fontSize={18} color={step.descriptionColor} margin="0">
                  {step.description}
                </TopicDescription>
                <TopicImage
                  width={260}
                  maxWidth="100%"
                  height={step.imageHeight}
                  margin="auto 0 0 auto"
                  marginMobile="auto 0 0 auto"
                  bgColor="transparent"
                >
                  <LazySVG src={step.image} />
                </TopicImage>
              </TopicCardInner>
            </TopicCard>
          ))}
        </TopicList>
      </ContainerCardSection>
    </ContainerCard>
  )
}
function WhyCowSwapSection(): ReactNode {
  return (
    <ContainerCard bgColor="transparent">
      <ContainerCardSection>
        <SectionTitleWrapper maxWidth={1300}>
          <SectionTitleIcon $size={82}>
            <ProductLogo variant={ProductVariant.CowProtocol} theme="light" logoIconOnly />
          </SectionTitleIcon>
          <SectionTitleText>Why CoW Swap?</SectionTitleText>
          <SectionTitleDescription color={`var(${UI.COLOR_NEUTRAL_40})`}>
            The DEX of choice for crypto whales and pros
          </SectionTitleDescription>
        </SectionTitleWrapper>
        <TopicList columns={4} columnsTablet={2}>
          {AFFILIATE_PROGRAM_METRICS.map((metric) => (
            <TopicCard
              key={metric.title}
              contentAlign="left"
              bgColor={`var(${UI.COLOR_YELLOW_800_PRIMARY})`}
              textColor={`var(${UI.COLOR_YELLOW_300_PRIMARY})`}
              padding="32px"
              asProp="div"
            >
              <TopicCardInner contentAlign="left">
                <TopicTitle fontSize={51}>{metric.title}</TopicTitle>
                <TopicDescription fontSize={21}>{metric.description}</TopicDescription>
              </TopicCardInner>
            </TopicCard>
          ))}
        </TopicList>
      </ContainerCardSection>
    </ContainerCard>
  )
}
function AffiliateFaqSection({ sendEvent }: { sendEvent: SendEvent }): ReactNode {
  return (
    <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_90})`} color={`var(${UI.COLOR_NEUTRAL_10})`}>
      <ContainerCardSection padding="0">
        <SectionTitleWrapper margin="6rem auto 0">
          <SectionTitleIcon $size={62}>
            <LazySVG src={IMG_ICON_FAQ} />
          </SectionTitleIcon>
          <SectionTitleText>FAQs</SectionTitleText>
        </SectionTitleWrapper>
        <FAQ faqs={getAffiliateProgramFaq(sendEvent)} fontSize={18} />

        <SectionTitleWrapper margin="2.4rem auto" maxWidth={900} gap={36}>
          <SectionTitleDescription fontSize={24} color={`var(${UI.COLOR_NEUTRAL_40})`}>
            Looking for more details? Read the full documentation and FAQ.
          </SectionTitleDescription>
          <Link
            bgColor={`var(${UI.COLOR_YELLOW_300_PRIMARY})`}
            color={`var(${UI.COLOR_YELLOW_800_PRIMARY})`}
            href={AFFILIATE_PROGRAM_DOCS_CTA.href}
            external
            linkType={LinkType.SectionTitleButton}
            utmContent="affiliate-program-read-full-docs"
            onClick={() => sendEvent('click-read-full-affiliate-docs')}
          >
            Read the docs &#8594;
          </Link>
        </SectionTitleWrapper>
      </ContainerCardSection>
    </ContainerCard>
  )
}
function FooterCtaSection({ sendEvent }: { sendEvent: SendEvent }): ReactNode {
  return (
    <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_100})`} color={`var(${UI.COLOR_NEUTRAL_10})`} touchFooter>
      <ContainerCardSection padding="6rem 0">
        <SectionTitleWrapper margin="0 auto">
          <SectionTitleIcon>
            <ProductLogo variant={ProductVariant.CowSwap} theme="light" logoIconOnly />
          </SectionTitleIcon>
          <SectionTitleText>Ready to turn your audience into earnings?</SectionTitleText>
          <SectionTitleDescription fontSize={28} color={`var(${UI.COLOR_NEUTRAL_30})`}>
            Generate your link. Share it. Earn USDC - every week.
          </SectionTitleDescription>
          <FooterCtaLinkOuter>
            <Link
              bgColor={`var(${UI.COLOR_YELLOW_300_PRIMARY})`}
              color={`var(${UI.COLOR_YELLOW_800_PRIMARY})`}
              href={AFFILIATE_PROGRAM_CTA.href}
              external
              linkType={LinkType.SectionTitleButton}
              utmContent="affiliate-program-footer-generate-link"
              onClick={() => sendEvent('click-generate-referral-link')}
            >
              Generate your referral link &#8594;
            </Link>
          </FooterCtaLinkOuter>
        </SectionTitleWrapper>
      </ContainerCardSection>
    </ContainerCard>
  )
}
export default function Page(): ReactNode {
  const analytics = useCowAnalytics()
  const { isAffiliateProgramEnabled } = useFeatureFlags()

  if (isAffiliateProgramEnabled === undefined) return null
  if (isAffiliateProgramEnabled === false) return <NotFoundPageComponent />

  const sendEvent = (action: string): void => {
    analytics.sendEvent({ category: CowFiCategory.COWSWAP, action })
  }
  return (
    <PageWrapper>
      <AffiliateHero sendEvent={sendEvent} />
      <HowItWorksSection />
      <WhyCowSwapSection />
      <AffiliateFaqSection sendEvent={sendEvent} />
      <FooterCtaSection sendEvent={sendEvent} />
    </PageWrapper>
  )
}
