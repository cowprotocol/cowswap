import type { ReactNode } from 'react'

import iconBuildWithCowSrc from '@cowprotocol/assets/images/icon-build-with-cow.svg'
import iconBulbCowSrc from '@cowprotocol/assets/images/icon-bulb-cow.svg'
import iconCowLensSrc from '@cowprotocol/assets/images/icon-cow-lens.svg'
import iconCrownCowSrc from '@cowprotocol/assets/images/icon-crown-cow.svg'
import iconFaqSrc from '@cowprotocol/assets/images/icon-faq.svg'
import iconGhostSrc from '@cowprotocol/assets/images/icon-ghost.svg'
import iconOwlSrc from '@cowprotocol/assets/images/icon-owl.svg'
import svgCowBitsSrc from '@cowprotocol/assets/images/image-cow-bits.svg'
import { Color, ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import { CowFiCategory, toCowFiGtmEvent } from 'src/common/analytics/types'

import {
  DeveloperParagraphs,
  MatchCard,
  MatchCardImage,
  MatchCardRows,
  MatchCardSubtitle,
  MatchCardTitle,
  SignOff,
} from './styled'

import FAQ from '@/components/FAQ'
import LazySVG from '@/components/LazySVG'
import { Link, LinkType } from '@/components/Link'
import {
  ACTIVE_HEADLINES,
  ALPHA_DISCLAIMER,
  DEVELOPERS,
  FINAL_CTA,
  HERO,
  HOW_IT_WORKS,
  MATCH_CARD,
  PARTNERS,
  SOLANA_FAQ,
  SOLANA_LINKS,
  STATS,
  TRUSTED,
  WHY_REASONS,
} from '@/data/solana/const'
import {
  ContainerCard,
  ContainerCardSection,
  HeroButtonWrapper,
  HeroContainer,
  HeroContent,
  HeroDescription,
  HeroSubtitle,
  HeroTitle,
  MetricsCard,
  MetricsItem,
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

interface PurpleLinkProps {
  href: string
  action: string
  children: ReactNode
  linkType?: LinkType
  variant?: 'solid' | 'ghost'
}

export function DevelopersSection(): ReactNode {
  const cards = [
    { ...DEVELOPERS.advanced, bgColor: Color.cowfi_purple3, titleColor: Color.neutral98 },
    { ...DEVELOPERS.easy, bgColor: Color.cowfi_purple_dark, titleColor: Color.neutral98 },
    { ...DEVELOPERS.trusted, bgColor: Color.cowfi_purple1, titleColor: Color.neutral98 },
  ]

  return (
    <ContainerCard bgColor="transparent">
      <ContainerCardSection>
        <SectionTitleWrapper color={`var(${UI.COLOR_NEUTRAL_10})`} maxWidth={1000}>
          <SectionTitleIcon $size={78}>
            <LazySVG src={iconBuildWithCowSrc} />
          </SectionTitleIcon>
          <SectionTitleText>{ACTIVE_HEADLINES.developers}</SectionTitleText>
          <SectionTitleDescription maxWidth={900} color={`var(${UI.COLOR_NEUTRAL_50})`}>
            {DEVELOPERS.intro}
          </SectionTitleDescription>
        </SectionTitleWrapper>

        <TopicList columns={3} columnsTablet={1}>
          {cards.map((card) => (
            <TopicCard
              key={card.title}
              contentAlign="left"
              bgColor={card.bgColor}
              textColor={Color.cowfi_purple_bright}
              padding="32px"
              asProp="div"
            >
              <TopicCardInner contentAlign="left">
                <TopicTitle color={card.titleColor}>{card.title}</TopicTitle>
                <DeveloperParagraphs>
                  {card.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </DeveloperParagraphs>
              </TopicCardInner>
              <TopicImage
                iconColor="transparent"
                bgColor="transparent"
                margin="auto 0 0 auto"
                height={160}
                width="auto"
              >
                <LazySVG src={card.imageSrc} />
              </TopicImage>
            </TopicCard>
          ))}
        </TopicList>

        <SectionTitleWrapper maxWidth={900} margin="56px auto 0">
          <SectionTitleText fontSize={38}>Build in the open</SectionTitleText>
          <SectionTitleDescription fontSize={21} color={`var(${UI.COLOR_NEUTRAL_50})`}>
            {DEVELOPERS.buildInTheOpen}
          </SectionTitleDescription>
          <HeroButtonWrapper width="auto" gap={12}>
            <PurpleLink href={SOLANA_LINKS.docs} action="read-the-docs">
              Read the docs
            </PurpleLink>
            <PurpleLink href={SOLANA_LINKS.github} action="view-on-github" variant="ghost">
              View on GitHub
            </PurpleLink>
            <PurpleLink href={SOLANA_LINKS.discord} action="join-discord" variant="ghost">
              Join the Discord
            </PurpleLink>
          </HeroButtonWrapper>
        </SectionTitleWrapper>
      </ContainerCardSection>
    </ContainerCard>
  )
}

export function DisclaimerSection(): ReactNode {
  return (
    <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_90})`} color={`var(${UI.COLOR_NEUTRAL_10})`} touchFooter>
      <ContainerCardSection padding="0">
        <SectionTitleWrapper maxWidth={1000} margin="0 auto">
          <SectionTitleDescription fontSize={16} color={`var(${UI.COLOR_NEUTRAL_40})`}>
            <b>* Solana Alpha · Unaudited:</b> {ALPHA_DISCLAIMER}
          </SectionTitleDescription>
        </SectionTitleWrapper>
      </ContainerCardSection>
    </ContainerCard>
  )
}

export function FaqSection(): ReactNode {
  return (
    <ContainerCard bgColor="transparent" color={`var(${UI.COLOR_NEUTRAL_10})`}>
      <ContainerCardSection>
        <SectionTitleWrapper>
          <SectionTitleIcon $size={62}>
            <LazySVG src={iconFaqSrc} />
          </SectionTitleIcon>
          <SectionTitleText>{ACTIVE_HEADLINES.faq}</SectionTitleText>
        </SectionTitleWrapper>

        <FAQ faqs={SOLANA_FAQ} />
      </ContainerCardSection>
    </ContainerCard>
  )
}

export function FinalCtaSection(): ReactNode {
  return (
    <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_90})`} color={`var(${UI.COLOR_NEUTRAL_10})`} touchFooter>
      <ContainerCardSection padding="0 0 100px">
        <SectionTitleWrapper margin="0 auto" maxWidth={900}>
          <SectionTitleIcon>
            <ProductLogo variant={ProductVariant.CowProtocol} theme="light" logoIconOnly />
          </SectionTitleIcon>
          <SectionTitleText>{ACTIVE_HEADLINES.finalCta}</SectionTitleText>
          <SectionTitleDescription fontSize={24} color={`var(${UI.COLOR_NEUTRAL_30})`}>
            {FINAL_CTA.body}
          </SectionTitleDescription>
          <HeroButtonWrapper width="auto" gap={12}>
            <PurpleLink href={SOLANA_LINKS.docs} action="integrate-cow-protocol">
              Integrate CoW Protocol
            </PurpleLink>
            <PurpleLink href={SOLANA_LINKS.getInTouch} action="talk-to-the-team" variant="ghost">
              Talk to the team
            </PurpleLink>
            <PurpleLink href={SOLANA_LINKS.tradeOnSolana} action="trade-on-cow-swap" variant="ghost">
              Trade on CoW Swap
            </PurpleLink>
          </HeroButtonWrapper>
        </SectionTitleWrapper>
      </ContainerCardSection>
    </ContainerCard>
  )
}

export function HeroSection(): ReactNode {
  return (
    <HeroContainer variant="secondary">
      <HeroContent variant="secondary">
        <HeroSubtitle color={Color.cowfi_purple3}>CoW Protocol on Solana</HeroSubtitle>
        <HeroTitle maxWidth={560}>{ACTIVE_HEADLINES.hero}</HeroTitle>
        <HeroDescription>{HERO.subhead}</HeroDescription>
        <SignOff>{HERO.signOff}</SignOff>
        <HeroButtonWrapper>
          <PurpleLink href={SOLANA_LINKS.getInTouch} action="get-in-touch" linkType={LinkType.HeroButton}>
            Get in touch
          </PurpleLink>
          <PurpleLink
            href={SOLANA_LINKS.startBuilding}
            action="start-building"
            linkType={LinkType.HeroButton}
            variant="ghost"
          >
            Start building
          </PurpleLink>
        </HeroButtonWrapper>
      </HeroContent>

      <MatchCard>
        <MatchCardImage>
          <LazySVG src={svgCowBitsSrc} />
        </MatchCardImage>
        <MatchCardTitle>{MATCH_CARD.title}</MatchCardTitle>
        <MatchCardSubtitle>{MATCH_CARD.subtitle}</MatchCardSubtitle>
        <MatchCardRows>
          {MATCH_CARD.rows.map(({ label, value }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </MatchCardRows>
      </MatchCard>
    </HeroContainer>
  )
}

export function HowItWorksSection(): ReactNode {
  return (
    <ContainerCard bgColor="transparent">
      <ContainerCardSection>
        <SectionTitleWrapper>
          <SectionTitleIcon $size={132}>
            <LazySVG src={iconCowLensSrc} />
          </SectionTitleIcon>
          <SectionTitleText>{ACTIVE_HEADLINES.howItWorks}</SectionTitleText>
          <SectionTitleDescription maxWidth={900} color={`var(${UI.COLOR_NEUTRAL_50})`}>
            {HOW_IT_WORKS.intro}
          </SectionTitleDescription>
        </SectionTitleWrapper>

        <TopicList columns={1} columnsTablet={1} maxWidth={1470}>
          {HOW_IT_WORKS.steps.map((step, index) => {
            const image = (
              <TopicImage
                iconColor="transparent"
                width={590}
                height={590}
                heightMobile="auto"
                widthMobile="100%"
                orderReverseMobile
                orderReverseTablet
                borderRadius={90}
              >
                <LazySVG src={step.imageSrc} />
              </TopicImage>
            )
            const imageFirst = index % 2 === 1

            return (
              <TopicCard key={step.title} columns="1fr auto" columnsTablet="1fr" gap={100} horizontal asProp="div">
                {imageFirst && image}
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={51}>
                    {index + 1}. {step.title}
                  </TopicTitle>
                  <TopicDescription fontSize={28} color={`var(${UI.COLOR_NEUTRAL_50})`}>
                    {step.description}
                  </TopicDescription>
                  <PurpleLink
                    href={step.linkHref}
                    action={`learn-more-step-${index + 1}`}
                    linkType={LinkType.TopicButton}
                  >
                    Learn more
                  </PurpleLink>
                </TopicCardInner>
                {!imageFirst && image}
              </TopicCard>
            )
          })}
        </TopicList>

        <SectionTitleWrapper maxWidth={900} margin="56px auto 0">
          <SectionTitleDescription fontSize={28} color={Color.cowfi_purple3} fontWeight="bold">
            {HOW_IT_WORKS.closing}
          </SectionTitleDescription>
        </SectionTitleWrapper>
      </ContainerCardSection>
    </ContainerCard>
  )
}

export function PartnersSection(): ReactNode {
  return (
    <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_98})`}>
      <ContainerCardSection>
        <SectionTitleWrapper color={`var(${UI.COLOR_NEUTRAL_0})`} maxWidth={1000}>
          <SectionTitleIcon $size={82}>
            <LazySVG src={iconCrownCowSrc} />
          </SectionTitleIcon>
          <SectionTitleText>{ACTIVE_HEADLINES.partners}</SectionTitleText>
          <SectionTitleDescription maxWidth={900} color={`var(${UI.COLOR_NEUTRAL_50})`}>
            {PARTNERS.intro}
          </SectionTitleDescription>
        </SectionTitleWrapper>

        <TopicList columns={3} columnsTablet={1}>
          {PARTNERS.audiences.map((audience) => (
            <TopicCard
              key={audience.title}
              contentAlign="left"
              bgColor={Color.cowfi_purple_bright}
              textColor={Color.cowfi_purple3}
              padding="32px"
              asProp="div"
            >
              <TopicCardInner contentAlign="left">
                <TopicTitle color={Color.cowfi_purple_dark}>{audience.title}</TopicTitle>
                <TopicDescription fontSize={21}>{audience.description}</TopicDescription>
              </TopicCardInner>
            </TopicCard>
          ))}
        </TopicList>

        <SectionTitleWrapper maxWidth={900} margin="56px auto 0" gap={24}>
          <SectionTitleDescription fontSize={24} color={`var(${UI.COLOR_NEUTRAL_10})`}>
            <b>The economics in one line:</b> {PARTNERS.economics}
          </SectionTitleDescription>
          <SectionTitleDescription fontSize={21} color={`var(${UI.COLOR_NEUTRAL_50})`}>
            <b>One bonus for your users:</b> {PARTNERS.bonus}
          </SectionTitleDescription>
          <HeroButtonWrapper width="auto" gap={12}>
            <PurpleLink href={SOLANA_LINKS.getInTouch} action="partners-talk-to-the-team">
              Talk to the team
            </PurpleLink>
            <PurpleLink href={SOLANA_LINKS.widget} action="partners-get-the-widget" variant="ghost">
              Get the widget
            </PurpleLink>
          </HeroButtonWrapper>
        </SectionTitleWrapper>
      </ContainerCardSection>
    </ContainerCard>
  )
}

export function StatsStrip(): ReactNode {
  return (
    <MetricsCard bgColor={Color.cowfi_purple_bright} color={Color.cowfi_purple3} columns={3} touchFooter>
      {STATS.map((stat, index) => (
        <MetricsItem key={stat.value} dividerColor={index < STATS.length - 1 ? Color.cowfi_purple4 : undefined}>
          <h2>{stat.value}</h2>
          <p>{stat.caption}</p>
        </MetricsItem>
      ))}
    </MetricsCard>
  )
}

export function TrustedSection(): ReactNode {
  return (
    <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_10})`} color={`var(${UI.COLOR_NEUTRAL_98})`}>
      <ContainerCardSection>
        <SectionTitleWrapper padding="150px 0 0">
          <SectionTitleIcon $multiple $size={60}>
            <LazySVG src={iconOwlSrc} />
            <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly height={60} />
            <LazySVG src={iconGhostSrc} />
          </SectionTitleIcon>
          <SectionTitleText>{ACTIVE_HEADLINES.trusted}</SectionTitleText>
        </SectionTitleWrapper>

        <TopicList columns={1} maxWidth={1200}>
          <TopicCard
            bgColor={Color.cowfi_purple3}
            textColor={Color.cowfi_purple_bright}
            padding="52px"
            gap={24}
            asProp="div"
          >
            <TopicImage iconColor={Color.neutral98} bgColor="transparent" height={48} width="auto" margin="0 auto 0 0">
              <LazySVG src={TRUSTED.lead.logo} title="Kamino" />
            </TopicImage>
            <TopicCardInner contentAlign="left">
              <TopicTitle fontSize={51} color={Color.neutral98}>
                {TRUSTED.lead.title}
              </TopicTitle>
              <TopicDescription fontSize={24}>{TRUSTED.lead.description}</TopicDescription>
            </TopicCardInner>
          </TopicCard>
        </TopicList>

        <TopicList columns={2} columnsTablet={1} maxWidth={1200}>
          {TRUSTED.cards.map((card) => (
            <TopicCard key={card.title} bgColor={`var(${UI.COLOR_NEUTRAL_100})`} padding="52px" gap={16} asProp="div">
              {card.logo && (
                <TopicImage
                  iconColor={`var(${UI.COLOR_NEUTRAL_10})`}
                  bgColor="transparent"
                  height={48}
                  width="auto"
                  margin="0 auto 0 0"
                >
                  <LazySVG src={card.logo} />
                </TopicImage>
              )}
              <TopicCardInner contentAlign="left">
                <TopicTitle fontSize={38}>{card.title}</TopicTitle>
                <TopicDescription fontSize={21}>{card.description}</TopicDescription>
                {card.link && (
                  <PurpleLink href={card.link} action="read-aave-case-study" linkType={LinkType.TopicButton}>
                    Read more
                  </PurpleLink>
                )}
              </TopicCardInner>
            </TopicCard>
          ))}
        </TopicList>

        <SectionTitleWrapper maxWidth={900} margin="56px auto 100px">
          <SectionTitleDescription fontSize={24} color={`var(${UI.COLOR_NEUTRAL_70})`}>
            {TRUSTED.closing}
          </SectionTitleDescription>
        </SectionTitleWrapper>
      </ContainerCardSection>
    </ContainerCard>
  )
}

export function WhySection(): ReactNode {
  return (
    <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_0})`} color={`var(${UI.COLOR_NEUTRAL_98})`}>
      <ContainerCardSection>
        <SectionTitleWrapper padding="150px 0 50px">
          <SectionTitleIcon $size={128}>
            <LazySVG src={iconBulbCowSrc} />
          </SectionTitleIcon>
          <SectionTitleText>{ACTIVE_HEADLINES.why}</SectionTitleText>
        </SectionTitleWrapper>

        <TopicList columns={2} columnsTablet={1}>
          {WHY_REASONS.map((reason) => (
            <TopicCard
              key={reason.title}
              contentAlign="left"
              bgColor={reason.bgColor}
              textColor={reason.textColor}
              padding="32px"
              asProp="div"
            >
              <TopicCardInner contentAlign="left">
                <TopicTitle color={reason.titleColor} fontSize={38} fontSizeMobile={28}>
                  {reason.title}
                </TopicTitle>
                <TopicDescription fontSize={21} color={reason.textColor}>
                  {reason.description}
                </TopicDescription>
              </TopicCardInner>
              <TopicImage
                iconColor="transparent"
                bgColor="transparent"
                margin="auto 0 0 auto"
                height={187}
                width="auto"
              >
                <LazySVG src={reason.imageSrc} />
              </TopicImage>
            </TopicCard>
          ))}
        </TopicList>
      </ContainerCardSection>
    </ContainerCard>
  )
}

function PurpleLink({
  href,
  action,
  children,
  linkType = LinkType.SectionTitleButton,
  variant = 'solid',
}: PurpleLinkProps): ReactNode {
  return (
    <Link
      bgColor={variant === 'solid' ? Color.cowfi_purple3 : 'transparent'}
      color={variant === 'solid' ? Color.cowfi_purple_bright : Color.cowfi_purple3}
      href={href}
      external={href.startsWith('http') || href.startsWith('mailto')}
      linkType={linkType}
      utmContent={href.startsWith('http') ? `solana-page-${action}` : undefined}
      data-click-event={toCowFiGtmEvent({ category: CowFiCategory.SOLANA, action })}
    >
      {children}
    </Link>
  )
}
