import type { ReactNode } from 'react'

import iconBuildWithCowSrc from '@cowprotocol/assets/images/icon-build-with-cow.svg'
import iconBulbCowSrc from '@cowprotocol/assets/images/icon-bulb-cow.svg'
import iconCowLensSrc from '@cowprotocol/assets/images/icon-cow-lens.svg'
import iconCrownCowSrc from '@cowprotocol/assets/images/icon-crown-cow.svg'
import iconFaqSrc from '@cowprotocol/assets/images/icon-faq.svg'
import iconGhostSrc from '@cowprotocol/assets/images/icon-ghost.svg'
import iconOwlSrc from '@cowprotocol/assets/images/icon-owl.svg'
import { Color, ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import { CowFiCategory, toCowFiGtmEvent } from 'src/common/analytics/types'

import { SolanaMatchCard } from './SolanaMatchCard'
import { CardFooter, DeveloperParagraphs, InlineLink, LeadAside, LeadStat, SignOff, SolanaHero } from './styled'

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
  HeroContent,
  HeroDescription,
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

const LINK_VARIANTS = {
  solid: { bgColor: Color.cowfi_purple3, color: Color.cowfi_purple_bright },
  ghost: { bgColor: 'transparent', color: Color.cowfi_purple3 },
}

interface PurpleLinkProps {
  href: string
  action: string
  children: ReactNode
  linkType?: LinkType
  variant?: keyof typeof LINK_VARIANTS
  newTab?: boolean
  fontSize?: number
  fontSizeMobile?: number
}

export function DevelopersSection(): ReactNode {
  const cards = [
    { ...DEVELOPERS.advanced, bgColor: Color.cowfi_purple3 },
    { ...DEVELOPERS.trusted, bgColor: Color.cowfi_purple_dark },
  ]

  return (
    <ContainerCard bgColor="transparent">
      <ContainerCardSection>
        <SectionTitleWrapper color={`var(${UI.COLOR_NEUTRAL_10})`} maxWidth={1000}>
          <SectionTitleIcon $size={78}>
            <LazySVG uniquifyIDs src={iconBuildWithCowSrc} />
          </SectionTitleIcon>
          <SectionTitleText>{ACTIVE_HEADLINES.developers}</SectionTitleText>
          <SectionTitleDescription maxWidth={900} color={`var(${UI.COLOR_NEUTRAL_50})`}>
            {DEVELOPERS.intro}
          </SectionTitleDescription>
        </SectionTitleWrapper>

        <TopicList columns={2} columnsTablet={1}>
          {cards.map((card) => (
            <TopicCard
              key={card.title}
              contentAlign="left"
              bgColor={card.bgColor}
              textColor={Color.cowfi_purple_bright}
              padding="40px"
              asProp="div"
            >
              <TopicCardInner contentAlign="left">
                <TopicTitle color={Color.neutral98} fontSize={38} fontSizeMobile={28}>
                  {card.title}
                </TopicTitle>
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
                <LazySVG uniquifyIDs src={card.imageSrc} />
              </TopicImage>
            </TopicCard>
          ))}
        </TopicList>

        <DeveloperDoors />

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
            <LazySVG uniquifyIDs src={iconFaqSrc} />
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
          <SignOff>{FINAL_CTA.signOff}</SignOff>
        </SectionTitleWrapper>
      </ContainerCardSection>
    </ContainerCard>
  )
}

export function HeroSection(): ReactNode {
  return (
    <SolanaHero variant="secondary">
      <HeroContent variant="secondary">
        <HeroTitle fontSize={67} fontSizeMobile={40} maxWidth={620}>
          {ACTIVE_HEADLINES.hero}
        </HeroTitle>
        <HeroDescription>{HERO.subhead}</HeroDescription>
        <HeroButtonWrapper>
          <PurpleLink href={SOLANA_LINKS.getInTouch} action="get-in-touch" fontSize={27} fontSizeMobile={21}>
            Get in touch
          </PurpleLink>
          <PurpleLink
            href={SOLANA_LINKS.startBuilding}
            action="start-building"
            variant="ghost"
            fontSize={27}
            fontSizeMobile={21}
          >
            Start building
          </PurpleLink>
        </HeroButtonWrapper>
      </HeroContent>

      <SolanaMatchCard />
    </SolanaHero>
  )
}

export function HowItWorksSection(): ReactNode {
  return (
    <ContainerCard bgColor="transparent">
      <ContainerCardSection>
        <SectionTitleWrapper>
          <SectionTitleIcon $size={132}>
            <LazySVG uniquifyIDs src={iconCowLensSrc} />
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
                <LazySVG uniquifyIDs src={step.imageSrc} />
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
            <LazySVG uniquifyIDs src={iconCrownCowSrc} />
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
            <LazySVG uniquifyIDs src={iconOwlSrc} />
            <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly height={60} />
            <LazySVG uniquifyIDs src={iconGhostSrc} />
          </SectionTitleIcon>
          <SectionTitleText>{ACTIVE_HEADLINES.trusted}</SectionTitleText>
        </SectionTitleWrapper>

        <TopicList columns={1} maxWidth={1200}>
          <TopicCard
            bgColor={Color.cowfi_purple3}
            textColor={Color.cowfi_purple_bright}
            padding="52px"
            columns="minmax(0, 1fr) minmax(0, 1.6fr)"
            columnsTablet="1fr"
            gap={56}
            horizontal
            asProp="div"
          >
            <LeadAside>
              <TopicImage
                iconColor={Color.neutral98}
                bgColor="transparent"
                height={56}
                width="auto"
                margin="0 auto 0 0"
              >
                <LazySVG uniquifyIDs src={TRUSTED.lead.logo} title="Kamino" />
              </TopicImage>
              <LeadStat>
                <strong>{TRUSTED.lead.stat.value}</strong>
                <span>{TRUSTED.lead.stat.caption}</span>
              </LeadStat>
            </LeadAside>
            <TopicCardInner contentAlign="left">
              <TopicTitle fontSize={51} fontSizeMobile={32} color={Color.neutral98}>
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
                  <LazySVG uniquifyIDs src={card.logo} />
                </TopicImage>
              )}
              <TopicCardInner contentAlign="left">
                <TopicTitle fontSize={38}>{card.title}</TopicTitle>
                <TopicDescription fontSize={21}>{card.description}</TopicDescription>
              </TopicCardInner>
              <CardFooter>
                <PurpleLink href={card.link.href} action={card.link.action} linkType={LinkType.TopicButton} newTab>
                  {card.link.text}
                </PurpleLink>
              </CardFooter>
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
            <LazySVG uniquifyIDs src={iconBulbCowSrc} />
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
                <LazySVG uniquifyIDs src={reason.imageSrc} />
              </TopicImage>
            </TopicCard>
          ))}
        </TopicList>
      </ContainerCardSection>
    </ContainerCard>
  )
}

function DeveloperDoors(): ReactNode {
  return (
    <>
      <SectionTitleWrapper maxWidth={900} margin="56px auto 0" color={`var(${UI.COLOR_NEUTRAL_10})`}>
        <SectionTitleText fontSize={38}>{DEVELOPERS.doorsIntro}</SectionTitleText>
      </SectionTitleWrapper>

      <TopicList columns={3} columnsTablet={1}>
        {DEVELOPERS.doors.map((door) => (
          <TopicCard
            key={door.title}
            contentAlign="left"
            bgColor={Color.cowfi_purple_bright}
            textColor={Color.cowfi_purple3}
            padding="32px"
            asProp="div"
          >
            <TopicCardInner contentAlign="left">
              <TopicTitle color={Color.cowfi_purple_dark}>{door.title}</TopicTitle>
              <TopicDescription fontSize={18} margin="16px 0 24px">
                {door.description}
              </TopicDescription>
            </TopicCardInner>
            <CardFooter>
              <PurpleLink
                href={door.linkHref}
                action={`door-${door.title.toLowerCase()}`}
                linkType={LinkType.TopicButton}
              >
                {door.linkText}
              </PurpleLink>
            </CardFooter>
          </TopicCard>
        ))}
      </TopicList>

      <SectionTitleWrapper maxWidth={800} margin="40px auto 0">
        <SectionTitleDescription fontSize={21} color={`var(${UI.COLOR_NEUTRAL_50})`}>
          {DEVELOPERS.learn.before}
          <InlineLink
            href={DEVELOPERS.learn.href}
            external
            utmContent="solana-page-learn-cow-fi"
            data-click-event={toCowFiGtmEvent({ category: CowFiCategory.SOLANA, action: 'learn-cow-fi' })}
          >
            {DEVELOPERS.learn.linkText}
          </InlineLink>
          {DEVELOPERS.learn.after}
        </SectionTitleDescription>
      </SectionTitleWrapper>
    </>
  )
}

function PurpleLink({
  href,
  action,
  children,
  linkType = LinkType.SectionTitleButton,
  variant = 'solid',
  newTab = false,
  fontSize,
  fontSizeMobile,
}: PurpleLinkProps): ReactNode {
  return (
    <Link
      bgColor={LINK_VARIANTS[variant].bgColor}
      color={LINK_VARIANTS[variant].color}
      href={href}
      external={newTab || href.startsWith('http')}
      linkType={linkType}
      fontSize={fontSize}
      fontSizeMobile={fontSizeMobile}
      utmContent={href.startsWith('http') ? `solana-page-${action}` : undefined}
      data-click-event={toCowFiGtmEvent({ category: CowFiCategory.SOLANA, action })}
    >
      {children}
    </Link>
  )
}
