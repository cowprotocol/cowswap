'use client'

import { useCowAnalytics } from '@cowprotocol/analytics'
import IMG_ICON_GHOST from '@cowprotocol/assets/images/icon-ghost.svg'
import IMG_ICON_OWL from '@cowprotocol/assets/images/icon-owl.svg'
import { Font, ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'
import { CowSwapWidget, CowSwapWidgetParams } from '@cowprotocol/widget-react'

import LazySVG from '@/components/LazySVG'
import { Link, LinkType } from '@/components/Link'
import { DAO_CONTENT as CONTENT } from '@/data/widget/const'
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
  WidgetContainer,
  HeroButtonWrapper,
} from '@/styles/styled'
import { CowFiCategory } from 'src/common/analytics/types'

const FEATURE_ITEMS = [
  'Live styling configurator',
  'Easy install with a snippet of code',
  'External wallet management - use your own wallet connection',
  'Internal wallet management - no wallet connection needed',
  'Configurable token lists',
  'Custom-tailored fees',
  'Fully responsive, from 320px and up',
  'Feature-adaptive display',
]

const widgetParams: CowSwapWidgetParams = {
  appCode: 'CoW Protocol: Widget Demo',
  theme: 'light',
  standaloneMode: true,
  width: '100%',
}

export default function Page() {
  const analytics = useCowAnalytics()

  return (
    <PageWrapper>
      <HeroContainer variant="secondary">
        <HeroContent variant="secondary">
          <HeroSubtitle color={'#66018E'}>Widget</HeroSubtitle>
          <HeroTitle fontSize={52} fontSizeMobile={38}>
            Bring reliable, MEV-protected swaps to your users
          </HeroTitle>
          <HeroDescription color={`var(${UI.COLOR_NEUTRAL_30})`}>
            Integrate the CoW Swap widget to bring seamless, MEV-protected trading to your website or dApp. Delight your
            users while adding an extra revenue stream for your project - it&apos;s a win-win
          </HeroDescription>

          <HeroButtonWrapper>
            <Link
              href="https://widget.cow.fi/"
              utmContent="widget-page-configure-widget-cta-hero"
              external
              linkType={LinkType.HeroButton}
              onClick={() =>
                analytics.sendEvent({
                  category: CowFiCategory.WIDGET,
                  action: 'click-config-widget',
                })
              }
            >
              {' '}
              Configure widget{' '}
            </Link>

            <Link
              bgColor="transparent"
              color={`var(${UI.COLOR_NEUTRAL_20})`}
              href="https://docs.cow.fi/cow-protocol/tutorials/widget"
              utmContent="widget-page-readdocs-cta-hero"
              external
              linkType={LinkType.HeroButton}
              onClick={() =>
                analytics.sendEvent({
                  category: CowFiCategory.WIDGET,
                  action: 'click-read-docs',
                })
              }
            >
              {' '}
              Read docs
            </Link>
          </HeroButtonWrapper>
        </HeroContent>

        <WidgetContainer id="COW-WIDGET">
          <CowSwapWidget params={widgetParams} />
        </WidgetContainer>
      </HeroContainer>

      <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_10})`} color={`var(${UI.COLOR_NEUTRAL_100})`}>
        <ContainerCardSection>
          <SectionTitleWrapper>
            <SectionTitleIcon $size={100}>
              <ProductLogo variant={ProductVariant.CowProtocol} theme="light" logoIconOnly />
            </SectionTitleIcon>
            <SectionTitleText>Integrate now</SectionTitleText>
          </SectionTitleWrapper>

          <TopicList columns={1} columnsTablet={1} maxWidth={1000}>
            <TopicCard
              columns="1fr auto"
              gap={100}
              horizontal
              asProp="div"
              bgColor={'transparent'}
              textColor={`var(${UI.COLOR_NEUTRAL_100})`}
            >
              <TopicCardInner contentAlign="left">
                <TopicTitle fontSize={48}>Earn Revenue for Your Project</TopicTitle>
                <TopicDescription fontSize={24} color={`var(${UI.COLOR_NEUTRAL_80})`}>
                  You may collect revenue when users trade with your widget*
                </TopicDescription>
              </TopicCardInner>
              <TopicImage width={400} height={400} heightMobile={300} orderReverseMobile bgColor="transparent">
                <img src="images/eth-circles.svg" alt="Make Money with CoW Swap" width="340" height="214" />
              </TopicImage>
            </TopicCard>

            <TopicCard
              columns="1fr auto"
              gap={100}
              horizontal
              asProp="div"
              bgColor="transparent"
              textColor={`var(${UI.COLOR_NEUTRAL_100})`}
            >
              <TopicImage width={400} height={400} heightMobile={300} orderReverseMobile bgColor="transparent">
                <img src="images/eth-blocks.svg" alt="Integrate With Ease" width="340" height="214" loading="lazy" />
              </TopicImage>
              <TopicCardInner contentAlign="left">
                <TopicTitle fontSize={67}>Integrate With Ease</TopicTitle>
                <TopicDescription fontSize={24} color={`var(${UI.COLOR_NEUTRAL_80})`}>
                  The CoW Swap widget is quick to install and easy to customize. Add the widget to your site in under 5
                  minutes by copy-pasting a few lines of code. Contact our team for implementation details
                </TopicDescription>
              </TopicCardInner>
            </TopicCard>
          </TopicList>
        </ContainerCardSection>
      </ContainerCard>

      <ContainerCard bgColor={'transparent'} color={`var(${UI.COLOR_NEUTRAL_10})`}>
        <ContainerCardSection>
          <SectionTitleWrapper maxWidth={900}>
            <SectionTitleIcon $size={60}>
              <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly />
            </SectionTitleIcon>
            <SectionTitleText fontSize={62}>Every Bell, Whistle, and Moo</SectionTitleText>
            <SectionTitleDescription fontSize={24} color={`var(${UI.COLOR_NEUTRAL_40})`}>
              With the CoW Swap widget, you can offer your users everything you know and love about CoW Swap, and more.
              Oh, and yes… it does come with the &quot;moo&quot;
            </SectionTitleDescription>
          </SectionTitleWrapper>

          <TopicList columns={3} columnsTablet={2}>
            <TopicCard
              contentAlign={'left'}
              bgColor={`var(${UI.COLOR_NEUTRAL_100})`}
              padding={'32px'}
              gap={16}
              asProp="div"
            >
              <TopicImage bgColor="transparent" height={75} width={'auto'}>
                <LazySVG src="images/protection.svg" />
              </TopicImage>
              <TopicCardInner contentAlign="left">
                <TopicTitle>Full protection from MEV</TopicTitle>
                <TopicDescription fontSize={18} color={`var(${UI.COLOR_NEUTRAL_40})`} margin="0">
                  CoW Swap offers the best MEV protection in the land. Thanks to a delegated trading model that relies
                  on experts to execute swaps, traders can rest assured that they&apos;re safe from the MEV bots
                </TopicDescription>
              </TopicCardInner>
            </TopicCard>

            <TopicCard
              contentAlign={'left'}
              bgColor={`var(${UI.COLOR_NEUTRAL_100})`}
              padding={'32px'}
              gap={16}
              asProp="div"
            >
              <TopicImage bgColor="transparent" height={75} width={'auto'}>
                <LazySVG src="images/surplus.svg" />
              </TopicImage>
              <TopicCardInner contentAlign="left">
                <TopicTitle>Surplus-capturing orders</TopicTitle>
                <TopicDescription fontSize={18} color={`var(${UI.COLOR_NEUTRAL_40})`} margin="0">
                  Every order is surplus-capturing and traders usually earn a little extra in their sell token with each
                  swap
                </TopicDescription>
              </TopicCardInner>
            </TopicCard>

            <TopicCard
              contentAlign={'left'}
              bgColor={`var(${UI.COLOR_NEUTRAL_100})`}
              padding={'32px'}
              gap={16}
              asProp="div"
            >
              <TopicImage bgColor="transparent" height={75} width={'auto'}>
                <LazySVG src="images/gasless.svg" />
              </TopicImage>
              <TopicCardInner contentAlign="left">
                <TopicTitle>Gasless trading</TopicTitle>
                <TopicDescription fontSize={18} color={`var(${UI.COLOR_NEUTRAL_40})`} margin="0">
                  All gas fees are paid in the sell token for swaps and even for token approvals. Users can enjoy
                  ETH-free trading every time, even with brand-new wallets
                </TopicDescription>
              </TopicCardInner>
            </TopicCard>
          </TopicList>
        </ContainerCardSection>
      </ContainerCard>

      <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_100})`} color={`var(${UI.COLOR_NEUTRAL_10})`}>
        <ContainerCardSection>
          <SectionTitleWrapper maxWidth={900}>
            <SectionTitleIcon $size={60}>
              <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly />
            </SectionTitleIcon>
            <SectionTitleText fontSize={62}>Everything You&apos;d Want in a Widget</SectionTitleText>
          </SectionTitleWrapper>

          <TopicList columns={4} columnsTablet={2} columnsMobile={1}>
            {FEATURE_ITEMS.map((item, index) => (
              <TopicCard
                key={index}
                contentAlign={'left'}
                bgColor={`var(${UI.COLOR_NEUTRAL_90})`}
                padding={'24px'}
                gap={12}
                asProp="div"
              >
                <TopicImage bgColor="transparent" height={42} width={'auto'}>
                  <LazySVG src="images/icons/check-color.svg" />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={23} fontWeight={Font.weight.medium}>
                    {item}
                  </TopicTitle>
                </TopicCardInner>
              </TopicCard>
            ))}
          </TopicList>
        </ContainerCardSection>
      </ContainerCard>

      <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_10})`} color={`var(${UI.COLOR_NEUTRAL_98})`}>
        <ContainerCardSection>
          <SectionTitleWrapper>
            <SectionTitleIcon $multiple>
              <LazySVG src={IMG_ICON_OWL} />
              <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly height={60} />
              <LazySVG src={IMG_ICON_GHOST} />
            </SectionTitleIcon>
            <SectionTitleText fontSize={90}>Trusted by the best</SectionTitleText>
          </SectionTitleWrapper>

          <TopicList columns={7} columnsMobile={2} maxWidth={1000} gap={10} margin="0 auto 100px">
            {CONTENT.trustedDAOs.map((dao, index) => {
              const isPng = dao.icon.endsWith('.png')
              return (
                <TopicCard
                  key={index}
                  contentAlign={'center'}
                  bgColor={`var(${UI.COLOR_NEUTRAL_20})`}
                  padding={'20px'}
                  href={dao.link}
                >
                  <TopicImage
                    iconColor={`var(${UI.COLOR_NEUTRAL_0})`}
                    bgColor={'transparent'}
                    width={75}
                    height={48}
                    margin={'auto'}
                  >
                    {isPng ? (
                      <img src={dao.icon} alt={dao.title} style={{ maxWidth: '100%' }} loading="lazy" />
                    ) : (
                      <LazySVG src={dao.icon} />
                    )}
                  </TopicImage>
                </TopicCard>
              )
            })}
          </TopicList>
        </ContainerCardSection>
      </ContainerCard>

      <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_90})`} color={`var(${UI.COLOR_NEUTRAL_10})`} touchFooter>
        <ContainerCardSection padding={'0 0 100px'}>
          <SectionTitleWrapper>
            <SectionTitleIcon>
              <ProductLogo variant={ProductVariant.CowSwap} theme="light" logoIconOnly />
            </SectionTitleIcon>
            <SectionTitleText>Integrate in 5 minutes or less</SectionTitleText>
            <HeroButtonWrapper width="auto">
              <Link
                href="https://widget.cow.fi/"
                utmContent="widget-page-configure-widget-cta-hero"
                external
                linkType={LinkType.HeroButton}
                onClick={() =>
                  analytics.sendEvent({
                    category: CowFiCategory.WIDGET,
                    action: 'click-config-widget',
                  })
                }
              >
                {' '}
                Configure widget{' '}
              </Link>

              <Link
                bgColor="transparent"
                color={`var(${UI.COLOR_NEUTRAL_20})`}
                href="https://docs.cow.fi/cow-protocol/tutorials/widget"
                utmContent="widget-page-readdocs-cta-hero"
                external
                linkType={LinkType.HeroButton}
                onClick={() =>
                  analytics.sendEvent({
                    category: CowFiCategory.WIDGET,
                    action: 'click-read-docs',
                  })
                }
              >
                {' '}
                Read docs
              </Link>
            </HeroButtonWrapper>
          </SectionTitleWrapper>
        </ContainerCardSection>
      </ContainerCard>

      <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_90})`} color={`var(${UI.COLOR_NEUTRAL_10})`} touchFooter>
        <ContainerCardSection padding={'0'}>
          <SectionTitleWrapper maxWidth={1000} margin="0 auto">
            <SectionTitleDescription fontSize={16} color={`var(${UI.COLOR_NEUTRAL_40})`}>
              <b>* Important Disclaimer:</b> Use of this widget is subject to the laws and regulations of your
              jurisdiction. You are solely responsible for ensuring compliance, and the provider is not liable for any
              legal consequences or issues arising from your failure to adhere. Using the widget indicates acceptance of
              the <Link href="/widget/terms-and-conditions">Terms and Conditions;</Link> if you do not agree, refrain
              from using it
            </SectionTitleDescription>
          </SectionTitleWrapper>
        </ContainerCardSection>
      </ContainerCard>
    </PageWrapper>
  )
}
