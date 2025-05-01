'use client'

import { Color, ProductLogo, ProductVariant } from '@cowprotocol/ui'
import IMG_ICON_CROWN_COW from '@cowprotocol/assets/images/icon-crown-cow.svg'
import IMG_ICON_BULB_COW from '@cowprotocol/assets/images/icon-bulb-cow.svg'
import IMG_ICON_BUILD_WITH_COW from '@cowprotocol/assets/images/icon-build-with-cow.svg'
import IMG_ICON_SECURE from '@cowprotocol/assets/images/icon-secure.svg'
import IMG_ICON_OWL from '@cowprotocol/assets/images/icon-owl.svg'
import IMG_ICON_GHOST from '@cowprotocol/assets/images/icon-ghost.svg'
import IMG_LOGO_SAFE from '@cowprotocol/assets/images/icon-logo-safe.svg'
import IMG_LOGO_LIDO from '@cowprotocol/assets/images/icon-logo-lido.svg'
import IMG_LOGO_CURVE from '@cowprotocol/assets/images/icon-logo-curve.svg'
import IMG_INTENTS from '@cowprotocol/assets/images/image-intents.svg'
import IMG_SOLVERS from '@cowprotocol/assets/images/image-solvers.svg'
import IMG_BATCHAUCTIONS from '@cowprotocol/assets/images/image-batchauctions.svg'
import IMG_COW_LENS from '@cowprotocol/assets/images/icon-cow-lens.svg'
import IMG_COW_BITS from '@cowprotocol/assets/images/image-cow-bits.svg'
import IMG_LEADING from '@cowprotocol/assets/images/image-leading.svg'
import FAQ from '@/components/FAQ'
import { Link, LinkType } from '@/components/Link'
import { CowFiCategory, toCowFiGtmEvent } from 'src/common/analytics/types'

import {
  ContainerCard,
  ContainerCardSection,
  HeroContainer,
  HeroContent,
  HeroDescription,
  HeroImage,
  HeroSubtitle,
  HeroTitle,
  MetricsCard,
  MetricsItem,
  PageWrapper,
  SectionImage,
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

import LazySVG from '@/components/LazySVG'
import IMG_ICON_FAQ from '@cowprotocol/assets/images/icon-faq.svg'

import {
  ADVANCED_ORDER_TYPES,
  ALL_LOGOS,
  CASE_STUDIES,
  COW_PROTOCOL_SECTIONS,
  useFaqData,
  TOP_LOGOS,
  UNIQUE_TRADING_LOGIC,
} from '@/data/cow-protocol/const'

export default function Page() {
  const faqData = useFaqData()

  return (
    <PageWrapper>
      <HeroContainer variant="secondary">
        <HeroContent variant="secondary">
          <HeroSubtitle color={Color.cowfi_purple3}>CoW Protocol</HeroSubtitle>
          <HeroTitle maxWidth={520}>Do what you want, build what you want</HeroTitle>
          <HeroDescription>
            CoW Protocol has the largest solver competition and the most advanced developer framework - so you can build
            any DeFi-related action you can imagine
          </HeroDescription>
          <Link
            bgColor={Color.cowfi_purple3}
            color={Color.cowfi_purple_bright}
            href="https://docs.cow.fi/category/tutorials"
            external
            linkType={LinkType.HeroButton}
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.COWPROTOCOL,
              action: 'Start Building Tutorial Navigation',
            })}
          >
            Start building
          </Link>
        </HeroContent>
        <HeroImage width={470} height={470} color={Color.cowfi_purple3}>
          <LazySVG src={IMG_COW_BITS} />
        </HeroImage>
      </HeroContainer>

      <MetricsCard bgColor={Color.cowfi_purple_bright} color={Color.cowfi_purple3} columns={3} touchFooter>
        <MetricsItem dividerColor={Color.cowfi_purple4}>
          <h2>29</h2>
          <p>active solvers settling batches</p>
        </MetricsItem>
        <MetricsItem dividerColor={Color.cowfi_purple4}>
          <h2>#1</h2>
          <p>intent-based DEX protocol by volume</p>
        </MetricsItem>

        <MetricsItem>
          <h2>2.1B+</h2>
          <p>all time transactions</p>
        </MetricsItem>

        <Link
          bgColor="transparent"
          color={Color.cowfi_purple3}
          margin="24px auto 0"
          gridFullWidth
          href="https://dune.com/cowprotocol/cowswap"
          external
          linkType={LinkType.SectionTitleButton}
          utmContent="cow-protocol-metrics"
          data-click-event={toCowFiGtmEvent({
            category: CowFiCategory.COWPROTOCOL,
            action: 'View Metrics On Dune',
          })}
        >
          View all metrics on DUNE &#8599;
        </Link>
      </MetricsCard>

      <ContainerCard bgColor={Color.neutral98}>
        <ContainerCardSection>
          <SectionTitleWrapper color={Color.neutral0} maxWidth={700} gap={56}>
            <SectionTitleIcon $size={82}>
              <LazySVG src={IMG_ICON_CROWN_COW} />
            </SectionTitleIcon>
            <SectionTitleText>The leading intents-based DEX aggregation protocol</SectionTitleText>
            <SectionTitleDescription maxWidth={900} color={Color.neutral50}>
              CoW Protocol leverages intents, batch auctions, and the largest solver network in DeFi to bring
              surplus-capturing, MEV-protected trades to users
            </SectionTitleDescription>
          </SectionTitleWrapper>
          <SectionImage>
            <LazySVG src={IMG_LEADING} />
          </SectionImage>
        </ContainerCardSection>
      </ContainerCard>

      <ContainerCard bgColor={'transparent'}>
        <ContainerCardSection>
          <SectionTitleWrapper>
            <SectionTitleIcon $size={132}>
              <LazySVG src={IMG_COW_LENS} />
            </SectionTitleIcon>
            <SectionTitleText>How it works</SectionTitleText>
            <SectionTitleDescription maxWidth={900} color={Color.neutral50}>
              CoW Protocol hosts a continuous competition between solvers to find better prices and protect users from
              MEV
            </SectionTitleDescription>
          </SectionTitleWrapper>

          <TopicList columns={1} columnsTablet={1} maxWidth={1470}>
            <TopicCard columns="repeat(2, 1fr)" columnsTablet="1fr" gap={100} horizontal asProp="div">
              <TopicCardInner contentAlign="left">
                <TopicTitle fontSize={51}>Intents</TopicTitle>
                <TopicDescription fontSize={28} color={Color.neutral50}>
                  CoW Protocol users sign an "intent to trade" message instead of directly executing orders on-chain
                  (like on Uniswap). This lets solvers trade on behalf of the user
                </TopicDescription>
                <Link
                  bgColor={Color.cowfi_purple3}
                  color={Color.cowfi_purple_bright}
                  href="https://docs.cow.fi/cow-protocol/reference/core/intents"
                  external
                  data-click-event={toCowFiGtmEvent({
                    category: CowFiCategory.COWPROTOCOL,
                    action: 'Open Intents Documentation',
                  })}
                  linkType={LinkType.TopicButton}
                >
                  Learn more
                </Link>
              </TopicCardInner>
              <TopicImage
                iconColor="transparent"
                width={590}
                height={590}
                heightMobile={'auto'}
                widthMobile={'100%'}
                orderReverseMobile
                orderReverseTablet
                borderRadius={90}
              >
                <LazySVG src={IMG_INTENTS} />
              </TopicImage>
            </TopicCard>

            <TopicCard columns="1fr auto" columnsTablet="1fr" gap={100} horizontal asProp="div">
              <TopicImage
                iconColor="transparent"
                width={590}
                height={590}
                heightMobile={'auto'}
                widthMobile={'100%'}
                orderReverseMobile
                orderReverseTablet
                borderRadius={90}
              >
                <LazySVG src={IMG_SOLVERS} />
              </TopicImage>
              <TopicCardInner contentAlign="left">
                <TopicTitle fontSize={51}>Solvers</TopicTitle>
                <TopicDescription fontSize={28} color={Color.neutral50}>
                  Professional third parties known as solvers find the most optimal trade path from a combination of
                  public and private liquidity sources - finding better prices than most users could find on their own
                </TopicDescription>
                <Link
                  bgColor={Color.cowfi_purple3}
                  color={Color.cowfi_purple_bright}
                  href="https://docs.cow.fi/cow-protocol/concepts/introduction/solvers"
                  external
                  data-click-event={toCowFiGtmEvent({
                    category: CowFiCategory.COWPROTOCOL,
                    action: 'Open Solvers Documentation',
                  })}
                  linkType={LinkType.TopicButton}
                >
                  Learn more
                </Link>
              </TopicCardInner>
            </TopicCard>

            <TopicCard columns="1fr auto" columnsTablet="1fr" gap={100} horizontal asProp="div">
              <TopicCardInner contentAlign="left">
                <TopicTitle fontSize={51}>Batch Auctions</TopicTitle>
                <TopicDescription fontSize={28} color={Color.neutral50}>
                  Solvers compete for the right to settle trades in batches, which give users additional MEV protection
                  and allow for Coincidence of Wants.
                  <br />
                  <br />
                  The solver that wins the batch auction is the solver that finds the most surplus - so they win when
                  you win
                </TopicDescription>
                <Link
                  bgColor={Color.cowfi_purple3}
                  color={Color.cowfi_purple_bright}
                  href="/learn/understanding-batch-auctions"
                  data-click-event={toCowFiGtmEvent({
                    category: CowFiCategory.COWPROTOCOL,
                    action: 'Open Batch Auctions Documentation',
                  })}
                  linkType={LinkType.TopicButton}
                >
                  Learn more
                </Link>
              </TopicCardInner>
              <TopicImage
                iconColor="transparent"
                width={590}
                height={590}
                heightMobile={'auto'}
                widthMobile={'100%'}
                orderReverseMobile
                borderRadius={90}
              >
                <LazySVG src={IMG_BATCHAUCTIONS} />
              </TopicImage>
            </TopicCard>
          </TopicList>
        </ContainerCardSection>
      </ContainerCard>

      <ContainerCard bgColor={Color.neutral0} color={Color.neutral98}>
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
          <TopicList columns={3} columnsTablet={2}>
            {ADVANCED_ORDER_TYPES.map((topic) => (
              <TopicCard
                key={topic.title}
                contentAlign="left"
                bgColor={topic.bgColor}
                textColor={topic.textColor}
                padding="32px"
                asProp="div"
              >
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={topic.titleColor}>{topic.title}</TopicTitle>
                  <TopicDescription fontSize={21} color={topic.textColor}>
                    {topic.description}
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor="transparent"
                  bgColor="transparent"
                  margin="auto 0 0 auto"
                  height="auto"
                  width="100%"
                >
                  <LazySVG src={topic.imageSrc} />
                </TopicImage>
              </TopicCard>
            ))}
          </TopicList>

          <SectionTitleWrapper padding="150px 0 50px">
            <SectionTitleText textAlign="center">Unique trading logic</SectionTitleText>
          </SectionTitleWrapper>
          <TopicList columns={3} columnsTablet={2}>
            {UNIQUE_TRADING_LOGIC.map((topic) => (
              <TopicCard
                key={topic.title}
                contentAlign="left"
                bgColor={topic.bgColor}
                textColor={topic.textColor}
                padding="32px"
                asProp="div"
              >
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={topic.titleColor}>{topic.title}</TopicTitle>
                  <TopicDescription fontSize={21} color={topic.textColor}>
                    {topic.description}
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor="transparent"
                  bgColor="transparent"
                  margin="auto 0 0 auto"
                  height="auto"
                  width="100%"
                >
                  <LazySVG src={topic.imageSrc} />
                </TopicImage>
              </TopicCard>
            ))}
          </TopicList>
        </ContainerCardSection>
      </ContainerCard>

      <ContainerCard bgColor={'transparent'}>
        <ContainerCardSection>
          <SectionTitleWrapper maxWidth={878} color={Color.neutral10}>
            <SectionTitleIcon $size={128}>
              <LazySVG src={IMG_ICON_BULB_COW} />
            </SectionTitleIcon>
            <SectionTitleText textAlign="center">Powering innovation across DeFi</SectionTitleText>
          </SectionTitleWrapper>

          <TopicList columns={3} columnsTablet={2}>
            <TopicCard
              contentAlign={'left'}
              bgColor={Color.cowfi_purple3}
              textColor={Color.cowfi_purple_bright}
              padding={'32px'}
              asProp="div"
            >
              <TopicImage iconColor={Color.cowfi_purple1} bgColor="transparent" height={96} width={'auto'}>
                <LazySVG src={IMG_LOGO_CURVE} />
              </TopicImage>
              <TopicCardInner contentAlign="left">
                <TopicTitle color={Color.neutral100}>Automating advanced treasury tasks</TopicTitle>
                <TopicDescription fontSize={21} color={Color.cowfi_purple_bright}>
                  Curve uses programmatic orders from CoW Protocol to streamline their fee burning processes. With the
                  integration in place, Curve can take fees in any token and convert them automatically to CRV, while
                  generating surplus and protecting themselves from MEV
                </TopicDescription>
              </TopicCardInner>
            </TopicCard>

            <TopicCard
              contentAlign={'left'}
              bgColor={Color.cowfi_purple3}
              textColor={Color.cowfi_purple_bright}
              padding={'32px'}
              asProp="div"
            >
              <TopicImage iconColor={Color.cowfi_purple1} bgColor="transparent" height={96} width={'auto'}>
                <LazySVG src={IMG_LOGO_LIDO} />
              </TopicImage>
              <TopicCardInner contentAlign="left">
                <TopicTitle color={Color.neutral100}>Adding security to sensitive transactions</TopicTitle>
                <TopicDescription fontSize={21} color={Color.cowfi_purple_bright}>
                  Lido leverages programmatic orders as the backbone of "stonks" - a set of smart contracts that they
                  use to manage treasury ops smoothly and securely without taking custody of funds. Stonks allows Lido
                  DAO to "set and forget" complex trade intents without compromising the prices they receive on future
                  swaps - minimizing time spent and human error
                </TopicDescription>
              </TopicCardInner>
            </TopicCard>

            <TopicCard
              contentAlign={'left'}
              bgColor={Color.cowfi_purple3}
              textColor={Color.cowfi_purple_bright}
              padding={'32px'}
              asProp="div"
            >
              <TopicImage iconColor={Color.cowfi_purple1} bgColor="transparent" height={96} width={'auto'}>
                <LazySVG src={IMG_LOGO_SAFE} />
              </TopicImage>
              <TopicCardInner contentAlign="left">
                <TopicTitle color={Color.neutral100}>Powering native swaps</TopicTitle>
                <TopicDescription fontSize={21} color={Color.cowfi_purple_bright}>
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
            <SectionTitleIcon $multiple $size={60}>
              <LazySVG src={IMG_ICON_OWL} />
              <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly height={60} />
              <LazySVG src={IMG_ICON_GHOST} />
            </SectionTitleIcon>
            <SectionTitleText>Trusted by the best</SectionTitleText>
          </SectionTitleWrapper>

          <TopicList columns={3}>
            {TOP_LOGOS.map((logo) => (
              <TopicCard
                key={logo.url}
                contentAlign={'center'}
                bgColor={Color.neutral100}
                padding={'42px'}
                href={`${logo.url}?utm_source=cow.fi&utm_medium=web&utm_content=cow-protocol-logos`}
                target="_blank"
                rel="noopener noreferrer nofollow"
                data-click-event={toCowFiGtmEvent({
                  category: CowFiCategory.COWPROTOCOL,
                  action: `Visit Partner ${logo.alt}`,
                })}
              >
                <TopicImage
                  iconColor={Color.neutral20}
                  bgColor={'transparent'}
                  width={'100%'}
                  height={54}
                  margin={'auto'}
                >
                  <LazySVG src={logo.src} title={logo.alt} />
                </TopicImage>
              </TopicCard>
            ))}

            {CASE_STUDIES.map((study) => (
              <TopicCard key={study.link} bgColor={Color.neutral100} padding={'52px'} gap={16} asProp="div">
                <TopicImage iconColor={Color.cowfi_purple3} bgColor="transparent" height={96} width={'auto'}>
                  <LazySVG src={study.logo} />
                </TopicImage>
                <TopicCardInner>
                  <TopicTitle fontSize={38}>{study.title}</TopicTitle>
                  <TopicDescription fontSize={21}>{study.description}</TopicDescription>
                  <Link
                    bgColor={Color.cowfi_purple3}
                    color={Color.cowfi_purple_bright}
                    fontSize={27}
                    href={study.link}
                    external
                    linkType={LinkType.TopicButton}
                    utmContent={`cow-protocol-case-study-${study.title}`}
                    data-click-event={toCowFiGtmEvent({
                      category: CowFiCategory.COWPROTOCOL,
                      action: `Read Case Study ${study.title}`,
                    })}
                  >
                    Read more
                  </Link>
                </TopicCardInner>
              </TopicCard>
            ))}
          </TopicList>

          <TopicList columns={4} columnsTablet={2}>
            {ALL_LOGOS.map((logo) => (
              <TopicCard
                key={logo.url}
                contentAlign={'center'}
                bgColor={Color.neutral100}
                padding={'42px'}
                href={`${logo.url}?utm_source=cow.fi&utm_medium=web&utm_content=cow-protocol-logos`}
                target="_blank"
                rel="noopener noreferrer nofollow"
                data-click-event={toCowFiGtmEvent({
                  category: CowFiCategory.COWPROTOCOL,
                  action: `Visit Partner ${logo.alt}`,
                })}
              >
                <TopicImage iconColor={Color.neutral20} bgColor={'transparent'} width={90} height={90} margin={'auto'}>
                  <LazySVG src={logo.src} title={logo.alt} />
                </TopicImage>
              </TopicCard>
            ))}
          </TopicList>
        </ContainerCardSection>
      </ContainerCard>

      <ContainerCard bgColor={'transparent'}>
        <ContainerCardSection>
          <SectionTitleWrapper color={Color.neutral10} maxWidth={1100}>
            <SectionTitleIcon $size={78}>
              <LazySVG src={IMG_ICON_BUILD_WITH_COW} />
            </SectionTitleIcon>
            <SectionTitleText>Build with CoW Protocol</SectionTitleText>
          </SectionTitleWrapper>

          <TopicList columns={3} columnsTablet={2}>
            {COW_PROTOCOL_SECTIONS.map((topic) => (
              <TopicCard
                key={topic.title}
                contentAlign="left"
                bgColor={topic.bgColor}
                textColor={topic.textColor}
                padding="32px"
                asProp="div"
              >
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={topic.titleColor}>{topic.title}</TopicTitle>
                  <TopicDescription fontSize={21} color={topic.textColor} minHeight={220}>
                    {topic.description}
                  </TopicDescription>
                  <Link
                    bgColor={topic.textColor}
                    color={topic.bgColor}
                    fontSize={27}
                    fontSizeMobile={24}
                    href={topic.linkHref}
                    linkType={LinkType.TopicButton}
                    data-click-event={toCowFiGtmEvent({
                      category: CowFiCategory.COWPROTOCOL,
                      action: topic.linkEvent,
                    })}
                    utmContent={topic.linkUtmContent}
                    external={topic.linkHref.startsWith('http')}
                  >
                    {topic.linkText}
                  </Link>
                </TopicCardInner>
                <TopicImage
                  iconColor={Color.cowfi_purple3}
                  bgColor="transparent"
                  margin="0 0 0 auto"
                  height={187}
                  width="auto"
                >
                  <LazySVG src={topic.imageSrc} />
                </TopicImage>
              </TopicCard>
            ))}
          </TopicList>
        </ContainerCardSection>
      </ContainerCard>

      <ContainerCard bgColor={'transparent'}>
        <ContainerCardSection>
          <SectionTitleWrapper maxWidth={1000}>
            <SectionTitleIcon $size={100}>
              <LazySVG src={IMG_ICON_SECURE} />
            </SectionTitleIcon>
            <SectionTitleText textAlign="center">Want to build a solver?</SectionTitleText>
            <SectionTitleDescription fontSize={28} color={Color.neutral30}>
              Solvers are the backbone of CoW Protocol. In a nutshell, solvers are optimization algorithms that compete
              to find CoW Protocol users the best possible settlements for their trade intents.
              <br />
              <br />
              Advanced solver teams can earn hundreds of thousands of dollars per year by winning batch auctions
              frequently.
              <br />
              <br />
              Learn more about building a solver by reading the CoW Protocol docs
            </SectionTitleDescription>

            <Link
              bgColor={Color.cowfi_purple3}
              color={Color.cowfi_purple_bright}
              href="https://docs.cow.fi/cow-protocol/tutorials/solvers"
              external
              linkType={LinkType.SectionTitleButton}
              utmContent="cow-protocol-solvers"
              margin="28px 0 0"
              data-click-event={toCowFiGtmEvent({
                category: CowFiCategory.COWPROTOCOL,
                action: 'Open Solver Development Documentation',
              })}
            >
              Read the docs
            </Link>
          </SectionTitleWrapper>
        </ContainerCardSection>
      </ContainerCard>

      <ContainerCard bgColor={Color.neutral90} color={Color.neutral10} touchFooter>
        <ContainerCardSection>
          <SectionTitleWrapper>
            <SectionTitleIcon $size={62}>
              <LazySVG src={IMG_ICON_FAQ} />
            </SectionTitleIcon>
            <SectionTitleText>FAQs</SectionTitleText>
          </SectionTitleWrapper>

          <FAQ faqs={faqData} />
        </ContainerCardSection>
      </ContainerCard>
    </PageWrapper>
  )
}
