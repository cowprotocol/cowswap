'use client'
import type { ReactNode } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import iconCowLensSrc from '@cowprotocol/assets/images/icon-cow-lens.svg'
import iconFaqSrc from '@cowprotocol/assets/images/icon-faq.svg'
import svgAffiliateHeroSrc from '@cowprotocol/assets/images/image-affiliate-hero.svg'
import { Media, ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import { CowFiCategory } from 'src/common/analytics/types'
import styled from 'styled-components/macro'

import type { AffiliateContent } from '@/util/marketingContent'

import { CmsFaqCopy, CmsInlineCopy } from '@/components/CmsMarketingCopy'
import FAQ from '@/components/FAQ'
import LazySVG from '@/components/LazySVG'
import { Link, LinkType } from '@/components/Link'
import { CONFIG } from '@/const/meta'
import {
  AFFILIATE_PROGRAM_CTA,
  AFFILIATE_PROGRAM_METRICS,
  AFFILIATE_PROGRAM_STEP_STYLES,
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

const FAQ_LINK_TRACKING = {
  [`${CONFIG.url.docs}/cow-protocol/affiliate-program/faq`]: {
    action: 'click-affiliate-faq-docs',
    utmContent: 'affiliate-program-faq-docs',
  },
  [CONFIG.social.discord.url]: {
    action: 'click-affiliate-discord-support',
    utmContent: 'affiliate-program-discord-support',
  },
}

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
export function AffiliateProgramPageContent({ content }: { content: AffiliateContent }): ReactNode {
  const analytics = useCowAnalytics()

  const sendEvent = (action: string): void => {
    analytics.sendEvent({ category: CowFiCategory.COWSWAP, action })
  }
  return (
    <PageWrapper>
      <AffiliateHero sendEvent={sendEvent} content={content} />
      <HowItWorksSection content={content} />
      <WhyCowSwapSection content={content} />
      <AffiliateFaqSection sendEvent={sendEvent} content={content} />
      <FooterCtaSection sendEvent={sendEvent} content={content} />
    </PageWrapper>
  )
}
function AffiliateFaqSection({ sendEvent, content }: { sendEvent: SendEvent; content: AffiliateContent }): ReactNode {
  return (
    <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_90})`} color={`var(${UI.COLOR_NEUTRAL_10})`}>
      <ContainerCardSection padding="0">
        <SectionTitleWrapper margin="6rem auto 0">
          <SectionTitleIcon $size={62}>
            <LazySVG src={iconFaqSrc} />
          </SectionTitleIcon>
          <SectionTitleText>{content.faq.title}</SectionTitleText>
        </SectionTitleWrapper>
        <FAQ
          faqs={content.faq.items.map((item) => ({
            question: item.title,
            answer: <CmsFaqCopy content={item.description} tracking={{ links: FAQ_LINK_TRACKING, sendEvent }} />,
          }))}
          fontSize={18}
        />

        <SectionTitleWrapper margin="2.4rem auto" maxWidth={900} gap={36}>
          <SectionTitleDescription fontSize={24} color={`var(${UI.COLOR_NEUTRAL_40})`}>
            <CmsInlineCopy content={content.faq.description} />
          </SectionTitleDescription>
          <Link
            bgColor={`var(${UI.COLOR_YELLOW_300_PRIMARY})`}
            color={`var(${UI.COLOR_YELLOW_800_PRIMARY})`}
            href={content.footer.docsButton.url}
            external={content.footer.docsButton.newTab}
            linkType={LinkType.SectionTitleButton}
            utmContent="affiliate-program-read-full-docs"
            onClick={() => sendEvent('click-read-full-affiliate-docs')}
          >
            {content.footer.docsButton.text}
          </Link>
        </SectionTitleWrapper>
      </ContainerCardSection>
    </ContainerCard>
  )
}
function AffiliateHero({ sendEvent, content }: { sendEvent: SendEvent; content: AffiliateContent }): ReactNode {
  return (
    <HeroContainer variant="secondary" minHeight="40vh">
      <HeroContent variant="secondary">
        <HeroSubtitle color={`var(${UI.COLOR_YELLOW_700_PRIMARY})`}>{content.label}</HeroSubtitle>
        <HeroTitle>{content.hero.title}</HeroTitle>
        <HeroDescription color={`var(${UI.COLOR_NEUTRAL_30})`}>
          <CmsInlineCopy content={content.hero.description} />
        </HeroDescription>
        <Link
          bgColor={`var(${UI.COLOR_YELLOW_800_PRIMARY})`}
          color={`var(${UI.COLOR_YELLOW_300_PRIMARY})`}
          href={content.hero.button.url}
          external={content.hero.button.newTab}
          linkType={LinkType.HeroButton}
          utmContent={AFFILIATE_PROGRAM_CTA.utmContent}
          onClick={() => sendEvent(AFFILIATE_PROGRAM_CTA.action)}
        >
          {content.hero.button.text}
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
        <LazySVG src={svgAffiliateHeroSrc} />
      </HeroImage>
    </HeroContainer>
  )
}
function FooterCtaSection({ sendEvent, content }: { sendEvent: SendEvent; content: AffiliateContent }): ReactNode {
  return (
    <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_100})`} color={`var(${UI.COLOR_NEUTRAL_10})`} touchFooter>
      <ContainerCardSection padding="6rem 0">
        <SectionTitleWrapper margin="0 auto">
          <SectionTitleIcon>
            <ProductLogo variant={ProductVariant.CowSwap} theme="light" logoIconOnly />
          </SectionTitleIcon>
          <SectionTitleText>{content.footer.title}</SectionTitleText>
          <SectionTitleDescription fontSize={28} color={`var(${UI.COLOR_NEUTRAL_30})`}>
            <CmsInlineCopy content={content.footer.description} />
          </SectionTitleDescription>
          <FooterCtaLinkOuter>
            <Link
              bgColor={`var(${UI.COLOR_YELLOW_300_PRIMARY})`}
              color={`var(${UI.COLOR_YELLOW_800_PRIMARY})`}
              href={content.footer.button.url}
              external={content.footer.button.newTab}
              linkType={LinkType.SectionTitleButton}
              utmContent="affiliate-program-footer-generate-link"
              onClick={() => sendEvent('click-generate-referral-link')}
            >
              {content.footer.button.text}
            </Link>
          </FooterCtaLinkOuter>
        </SectionTitleWrapper>
      </ContainerCardSection>
    </ContainerCard>
  )
}
function HowItWorksSection({ content }: { content: AffiliateContent }): ReactNode {
  return (
    <ContainerCard
      bgColor={`var(${UI.COLOR_NEUTRAL_10})`}
      color={`var(${UI.COLOR_NEUTRAL_100})`}
      padding="12rem 6rem 6rem"
    >
      <ContainerCardSection gap={64}>
        <SectionTitleWrapper color={`var(${UI.COLOR_NEUTRAL_100})`} margin="0 auto" gap={64}>
          <SectionTitleIcon $multiple $size={110}>
            <LazySVG src={iconCowLensSrc} style={{ filter: 'brightness(0) saturate(100%) invert(100%)' }} />
          </SectionTitleIcon>
          <SectionTitleText>{content.introduction.title}</SectionTitleText>
          <SectionTitleDescription color={`var(${UI.COLOR_NEUTRAL_70})`} fontSize={30} maxWidth={760}>
            <CmsInlineCopy content={content.introduction.description} />
          </SectionTitleDescription>
        </SectionTitleWrapper>
        <SectionTitleWrapper color={`var(${UI.COLOR_NEUTRAL_100})`} margin="6.4rem auto 1.6rem" gap={0}>
          <SectionTitleText fontSize={42} fontSizeMobile={32}>
            {content.steps.title}
          </SectionTitleText>
        </SectionTitleWrapper>
        <TopicList columns={3} columnsTablet={2} gap={24}>
          {content.steps.items.map((copy, index) => {
            const step = { ...AFFILIATE_PROGRAM_STEP_STYLES[index], ...copy }
            return (
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
                    <CmsInlineCopy content={step.description} />
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
            )
          })}
        </TopicList>
      </ContainerCardSection>
    </ContainerCard>
  )
}
function WhyCowSwapSection({ content }: { content: AffiliateContent }): ReactNode {
  return (
    <ContainerCard bgColor="transparent">
      <ContainerCardSection>
        <SectionTitleWrapper maxWidth={1300}>
          <SectionTitleIcon $size={82}>
            <ProductLogo variant={ProductVariant.CowProtocol} theme="light" logoIconOnly />
          </SectionTitleIcon>
          <SectionTitleText>{content.benefits.title}</SectionTitleText>
          <SectionTitleDescription color={`var(${UI.COLOR_NEUTRAL_40})`}>
            <CmsInlineCopy content={content.benefits.description} />
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
