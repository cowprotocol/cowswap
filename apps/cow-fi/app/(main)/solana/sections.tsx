import type { ReactNode } from 'react'

import svgCowCrownSrc from '@cowprotocol/assets/images/icon-cow-crown.svg'
import svgCowHeartEyesSrc from '@cowprotocol/assets/images/icon-cow-heart-eyes.svg'
import svgCowHornsSrc from '@cowprotocol/assets/images/icon-cow-horns.svg'
import svgCowKissSrc from '@cowprotocol/assets/images/icon-cow-kiss.svg'

import Image from 'next/image'
import { CowFiCategory, toCowFiGtmEvent } from 'src/common/analytics/types'

import {
  AudienceCard,
  Banner,
  ButtonRow,
  CapsLine,
  CardGrid,
  CenteredBlock,
  CowMark,
  ctaColors,
  CtaLink,
  DarkPanel,
  Disclaimer,
  FaqIcon,
  FaqItem,
  FaqList,
  HeadlineRoot,
  HeadlineSize,
  HeroCopy,
  HeroGrid,
  InlineLink,
  KaminoLogo,
  Lead,
  LeadAside,
  LeadCard,
  LeadStat,
  PartnerCard,
  PartnerCopy,
  PartnersClosing,
  PhotoFrame,
  ReasonCard,
  ScriptLine,
  SectionHeader,
  StatItem,
  StatsBackdrop,
  StatsPanel,
  StatusLabel,
  StatusTitle,
  StepCopy,
  StepRow,
  toneButton,
  ToneCard,
  ToneCopy,
} from './styled'

import LazySVG from '@/components/LazySVG'
import {
  ACTIVE_HEADLINES,
  ALPHA_DISCLAIMER,
  DEVELOPERS,
  FINAL_CTA,
  HeadlineLine,
  HERO,
  HOW_IT_WORKS,
  PARTNERS,
  SOLANA_FAQ,
  SOLANA_LINKS,
  STATS,
  TRUSTED,
  WHY_REASONS,
} from '@/data/solana/const'

interface CtaProps {
  href: string
  action: string
  label: string
  colors: keyof typeof ctaColors
  children: ReactNode
}

interface HeadlineProps {
  lines: HeadlineLine[]
  as?: 'h1' | 'h2'
  align?: 'left' | 'center'
  size?: HeadlineSize
}

const MARKS = {
  crown: { $src: svgCowCrownSrc, $width: 90, $height: 96 },
  heartEyes: { $src: svgCowHeartEyesSrc, $width: 96, $height: 64 },
  horns: { $src: svgCowHornsSrc, $width: 170, $height: 78 },
  kiss: { $src: svgCowKissSrc, $width: 136, $height: 104 },
}

export function DevelopersSection(): ReactNode {
  return (
    <section>
      <SectionHeader $padding="120px 0 80px">
        <CowMark {...MARKS.horns} aria-hidden="true" />
        <Headline lines={ACTIVE_HEADLINES.developers} />
        <Lead>{DEVELOPERS.intro}</Lead>
      </SectionHeader>

      <CardGrid>
        {DEVELOPERS.features.map((feature) => (
          <ReasonCard key={feature.title} $muted>
            <div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
            <PhotoFrame>
              <Image
                src={feature.image.src}
                alt={feature.image.alt}
                width={1280}
                height={700}
                sizes="(max-width: 960px) 100vw, 640px"
              />
            </PhotoFrame>
          </ReasonCard>
        ))}
      </CardGrid>

      <DeveloperDoors />

      <CenteredBlock $gap={40}>
        <Headline lines={[{ text: DEVELOPERS.buildInTheOpen.title }]} size="small" />
        <Lead>{DEVELOPERS.buildInTheOpen.body}</Lead>
        <ButtonRow $center>
          <Cta href={SOLANA_LINKS.docs} action="sol_read_the_docs" label="build_in_the_open" colors="solid">
            Read the docs
          </Cta>
          <Cta href={SOLANA_LINKS.github} action="sol_view_on_github" label="build_in_the_open" colors="ghost">
            View on GitHub
          </Cta>
          <Cta href={SOLANA_LINKS.discord} action="sol_join_the_discord" label="build_in_the_open" colors="ghost">
            Join the Discord
          </Cta>
        </ButtonRow>
      </CenteredBlock>
    </section>
  )
}

export function DisclaimerSection(): ReactNode {
  return (
    <Disclaimer>
      <b>* Solana Alpha · Unaudited:</b> {ALPHA_DISCLAIMER}
    </Disclaimer>
  )
}

export function FaqSection(): ReactNode {
  return (
    <section>
      <SectionHeader $padding="120px 0 80px">
        <Headline lines={ACTIVE_HEADLINES.faq} />
      </SectionHeader>
      <FaqList>
        {SOLANA_FAQ.map((faq) => (
          <FaqItem key={faq.question}>
            <summary>
              {faq.question}
              <FaqIcon aria-hidden="true" />
            </summary>
            <p>{faq.answer}</p>
          </FaqItem>
        ))}
      </FaqList>
    </section>
  )
}

export function FinalCtaSection(): ReactNode {
  return (
    <CenteredBlock as="section" $padding="120px 0" $gap={60}>
      <SectionHeader>
        <CowMark {...MARKS.heartEyes} aria-hidden="true" />
        <Headline lines={ACTIVE_HEADLINES.finalCta} />
        <Lead>{FINAL_CTA.body}</Lead>
      </SectionHeader>
      <Banner>
        <Image
          src={FINAL_CTA.image.src}
          alt={FINAL_CTA.image.alt}
          width={2944}
          height={1234}
          sizes="(max-width: 1760px) 100vw, 1640px"
        />
      </Banner>
      <ButtonRow $center>
        <Cta href={SOLANA_LINKS.docs} action="sol_integrate_cow_protocol" label="final_cta" colors="solid">
          Integrate CoW Protocol
        </Cta>
        <Cta href={SOLANA_LINKS.getInTouch} action="sol_talk_to_the_team" label="final_cta" colors="ghost">
          Talk to the team
        </Cta>
      </ButtonRow>
    </CenteredBlock>
  )
}

export function HeroSection(): ReactNode {
  return (
    <HeroGrid>
      <HeroCopy>
        <Headline as="h1" align="left" size="hero" lines={ACTIVE_HEADLINES.hero} />
        <Lead>{HERO.subhead}</Lead>
        <ButtonRow>
          <Cta href={SOLANA_LINKS.getInTouch} action="sol_talk_to_the_team" label="hero" colors="solid">
            Let’s get serious
          </Cta>
          <Cta href={SOLANA_LINKS.startBuilding} action="sol_start_building" label="hero" colors="ghost">
            Start building
          </Cta>
        </ButtonRow>
      </HeroCopy>
      <PhotoFrame>
        <Image
          src={HERO.image.src}
          alt={HERO.image.alt}
          width={1200}
          height={1200}
          sizes="(max-width: 960px) 100vw, 600px"
          priority
        />
      </PhotoFrame>
    </HeroGrid>
  )
}

export function HowItWorksSection(): ReactNode {
  return (
    <section>
      <SectionHeader $padding="120px 0 80px">
        <CowMark {...MARKS.kiss} aria-hidden="true" />
        <Headline lines={ACTIVE_HEADLINES.howItWorks} />
        <Lead>{HOW_IT_WORKS.intro}</Lead>
      </SectionHeader>

      {HOW_IT_WORKS.steps.map((step, index) => (
        <StepRow key={step.title} $imageFirst={index % 2 === 1}>
          <StepCopy>
            <h3>{step.title}</h3>
            <Lead>{step.description}</Lead>
          </StepCopy>
          <PhotoFrame>
            <Image
              src={step.image.src}
              alt={step.image.alt}
              width={1186}
              height={1184}
              sizes="(max-width: 960px) 100vw, 593px"
            />
          </PhotoFrame>
        </StepRow>
      ))}

      <CenteredBlock>
        <Headline lines={[{ text: HOW_IT_WORKS.closing.title }]} size="small" />
        <Lead>
          {HOW_IT_WORKS.closing.lines[0]}
          <br />
          {HOW_IT_WORKS.closing.lines[1]}
        </Lead>
      </CenteredBlock>
    </section>
  )
}

export function PartnersSection(): ReactNode {
  return (
    <DarkPanel $marginTop={64} $marginBottom={64}>
      <SectionHeader $marginBottom={90}>
        <CowMark {...MARKS.crown} aria-hidden="true" />
        <Headline lines={ACTIVE_HEADLINES.partners} />
        <Lead>{PARTNERS.intro}</Lead>
      </SectionHeader>

      <CardGrid $columns={3}>
        {PARTNERS.audiences.map((audience) => (
          <AudienceCard key={audience.title}>
            <h3>{audience.title}</h3>
            <p>{audience.description}</p>
          </AudienceCard>
        ))}
      </CardGrid>

      <PartnersClosing>
        <Lead>{PARTNERS.economics}</Lead>
        <ButtonRow $center>
          <Cta href={SOLANA_LINKS.getInTouch} action="sol_talk_to_the_team" label="partners" colors="solid">
            Talk to the team
          </Cta>
          <Cta href={SOLANA_LINKS.widget} action="sol_get_the_widget" label="partners" colors="ghostOnDark">
            Get the widget
          </Cta>
        </ButtonRow>
      </PartnersClosing>
    </DarkPanel>
  )
}

export function StatsStrip(): ReactNode {
  return (
    <StatsPanel>
      {STATS.map((stat) => (
        <StatItem key={stat.value}>
          <strong>{stat.value}</strong>
          <p>{stat.caption}</p>
        </StatItem>
      ))}
    </StatsPanel>
  )
}

export function TrustedSection(): ReactNode {
  return (
    <DarkPanel $marginTop={64} $marginBottom={64}>
      <SectionHeader $marginBottom={90}>
        <CowMark {...MARKS.heartEyes} aria-hidden="true" />
        <Headline lines={ACTIVE_HEADLINES.trusted} />
      </SectionHeader>

      <LeadCard>
        <LeadAside>
          <KaminoLogo>
            <LazySVG uniquifyIDs src={TRUSTED.lead.logo} title="Kamino" />
          </KaminoLogo>
          <LeadStat>{TRUSTED.lead.stat}</LeadStat>
        </LeadAside>
        <PartnerCopy>
          <h3>{TRUSTED.lead.title}</h3>
          <p>{TRUSTED.lead.description}</p>
        </PartnerCopy>
      </LeadCard>

      <CardGrid $marginTop={40}>
        {TRUSTED.cards.map((card) => (
          <PartnerCard key={card.title}>
            <Image src={card.icon.src} alt={card.icon.alt} width={160} height={160} sizes="80px" />
            <PartnerCopy>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </PartnerCopy>
          </PartnerCard>
        ))}
      </CardGrid>

      <CenteredBlock $padding="80px 0 0" $gap={40}>
        <StatusTitle>
          <StatusLabel>{TRUSTED.closing.status}</StatusLabel>{' '}
          <ScriptLine $size="small">{TRUSTED.closing.value}</ScriptLine>
        </StatusTitle>
        <Lead>
          {TRUSTED.closing.lines[0]}
          <br />
          {TRUSTED.closing.lines[1]}
        </Lead>
      </CenteredBlock>
    </DarkPanel>
  )
}

export function WhySection(): ReactNode {
  return (
    <StatsBackdrop>
      <DarkPanel $marginBottom={64} $paddingBottom={60}>
        <SectionHeader $marginBottom={72}>
          <CowMark {...MARKS.heartEyes} aria-hidden="true" />
          <Headline lines={ACTIVE_HEADLINES.why} />
        </SectionHeader>

        <CardGrid>
          {WHY_REASONS.map((reason) => (
            <ReasonCard key={reason.title}>
              <div>
                <h3>{reason.title}</h3>
                <p>{reason.description}</p>
              </div>
              <PhotoFrame>
                <Image
                  src={reason.image.src}
                  alt={reason.image.alt}
                  width={1152}
                  height={700}
                  sizes="(max-width: 960px) 100vw, 576px"
                />
              </PhotoFrame>
            </ReasonCard>
          ))}
        </CardGrid>
      </DarkPanel>
    </StatsBackdrop>
  )
}

function Cta({ href, action, label, colors, children }: CtaProps): ReactNode {
  const isExternal = href.startsWith('http')

  return (
    <CtaLink
      {...ctaColors[colors]}
      href={href}
      external={isExternal}
      utmContent={isExternal ? action : undefined}
      data-click-event={toCowFiGtmEvent({ category: CowFiCategory.SOLANA, action, label })}
    >
      {children}
    </CtaLink>
  )
}

function DeveloperDoors(): ReactNode {
  return (
    <>
      <SectionHeader $padding="120px 0 60px">
        <Headline lines={ACTIVE_HEADLINES.doors} size="small" />
      </SectionHeader>

      <CardGrid $columns={3}>
        {DEVELOPERS.doors.map((door) => (
          <ToneCard key={door.title} $tone={door.tone}>
            <ToneCopy>
              <h3>{door.title}</h3>
              <p>{door.description}</p>
            </ToneCopy>
            <ButtonRow>
              <CtaLink
                {...toneButton(door.tone)}
                href={door.linkHref}
                external={door.linkHref.startsWith('http')}
                utmContent={door.linkHref.startsWith('http') ? door.action : undefined}
                data-click-event={toCowFiGtmEvent({
                  category: CowFiCategory.SOLANA,
                  action: door.action,
                  label: 'doors',
                })}
              >
                {door.linkText}
              </CtaLink>
            </ButtonRow>
          </ToneCard>
        ))}
      </CardGrid>

      <CenteredBlock>
        <Lead>
          {DEVELOPERS.learn.before}
          <InlineLink
            href={DEVELOPERS.learn.href}
            external
            utmContent="sol_learn_cow_fi"
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.SOLANA,
              action: 'sol_learn_cow_fi',
              label: 'doors',
            })}
          >
            {DEVELOPERS.learn.linkText}
          </InlineLink>
          {DEVELOPERS.learn.after}
        </Lead>
      </CenteredBlock>
    </>
  )
}

function Headline({ lines, as = 'h2', align = 'center', size = 'section' }: HeadlineProps): ReactNode {
  const scriptFirst = lines[0]?.script
  const captionGap = size === 'small' ? 14 : 24

  return (
    <HeadlineRoot as={as} $align={align} $gap={scriptFirst ? 0 : captionGap}>
      {lines.map(({ text, script }) =>
        script ? (
          <ScriptLine key={text} $size={size}>
            {text}{' '}
          </ScriptLine>
        ) : (
          <CapsLine key={text} $size={size}>
            {text}{' '}
          </CapsLine>
        ),
      )}
    </HeadlineRoot>
  )
}
