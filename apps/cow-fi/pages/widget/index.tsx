import { GetStaticProps } from 'next'
import { Font, Color, ProductLogo, ProductVariant } from '@cowprotocol/ui'

import IMG_ICON_OWL from '@cowprotocol/assets/images/icon-owl.svg'
import IMG_ICON_GHOST from '@cowprotocol/assets/images/icon-ghost.svg'

import styled from 'styled-components'

import { CONFIG } from '@/const/meta'

import Layout from '@/components/Layout'
import FAQ from '@/components/FAQ'
import { Link, LinkType } from '@/components/Link'

import { CowSwapWidget, CowSwapWidgetParams } from '@cowprotocol/widget-react'

import { GAEventCategories } from 'lib/analytics/GAEvents'
import { sendGAEventHandler } from 'lib/analytics/sendGAEvent'

import {
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

import { DAO_CONTENT as CONTENT } from '@/data/siteContent/daos'

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

interface PageProps {
  siteConfigData: typeof CONFIG
}

const widgetParams: CowSwapWidgetParams = {
  appCode: 'CoW Protocol: Widget Demo',
  theme: 'light',
  standaloneMode: true,
  width: '100%',
}

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  max-width: 1760px;
  width: 100%;
  margin: 76px auto 0;
  gap: 34px;
`

export default function Page({ siteConfigData }: PageProps) {
  return (
    <Layout
      bgColor={Color.neutral90}
      metaTitle="Widget - Bring reliable, MEV-protected swaps to your users"
      metaDescription="Integrate the CoW Swap widget to bring seamless, MEV-protected trading to your website or dApp."
    >
      <Wrapper>
        <HeroContainer variant="secondary" maxWidth={1300}>
          <HeroContent variant="secondary">
            <HeroSubtitle color={'#66018E'}>Widget</HeroSubtitle>
            <HeroTitle fontSize={52} fontSizeMobile={38}>
              Bring reliable, MEV-protected swaps to your users
            </HeroTitle>
            <HeroDescription color={Color.neutral30}>
              Integrate the CoW Swap widget to bring seamless, MEV-protected trading to your website or dApp. Delight
              your users while adding an extra revenue stream for your project - it's a win-win.
            </HeroDescription>

            <HeroButtonWrapper>
              <Link
                href="https://widget.cow.fi/"
                utmContent="widget-page-configure-widget-cta-hero"
                external
                linkType={LinkType.HeroButton}
                onClick={() => sendGAEventHandler(GAEventCategories.WIDGET, 'click-config-widget')}
              >
                {' '}
                Configure widget{' '}
              </Link>

              <Link
                bgColor="transparent"
                color={Color.neutral20}
                href="https://docs.cow.fi/cow-protocol/tutorials/widget"
                utmContent="widget-page-readdocs-cta-hero"
                external
                linkType={LinkType.HeroButton}
                onClick={() => sendGAEventHandler(GAEventCategories.WIDGET, 'click-read-docs')}
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

        <ContainerCard bgColor={Color.neutral10} color={Color.neutral100}>
          <ContainerCardSection>
            <SectionTitleWrapper>
              <SectionTitleIcon size={100}>
                <ProductLogo variant={ProductVariant.CowProtocol} theme="light" logoIconOnly />
              </SectionTitleIcon>
              <SectionTitleText>Integrate now</SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={1} maxWidth={1000}>
              <TopicCard
                columns="1fr auto"
                gap={100}
                horizontal
                asProp="div"
                bgColor={'transparent'}
                textColor={Color.neutral100}
              >
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={48}>Earn Revenue for Your Project</TopicTitle>
                  <TopicDescription fontSize={24} color={Color.neutral80}>
                    You may collect revenue when users trade with your widget.*
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
                textColor={Color.neutral100}
              >
                <TopicImage width={400} height={400} heightMobile={300} orderReverseMobile bgColor="transparent">
                  <img src="images//eth-blocks.svg" alt="Integrate With Ease" width="340" height="214" />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={67}>Integrate With Ease</TopicTitle>
                  <TopicDescription fontSize={24} color={Color.neutral80}>
                    The CoW Swap widget is quick to install and easy to customize. Add the widget to your site in under
                    5 minutes by copy-pasting a few lines of code. Contact our team for implementation details.
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'} color={Color.neutral10}>
          <ContainerCardSection>
            <SectionTitleWrapper maxWidth={900}>
              <SectionTitleIcon size={60}>
                <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly />
              </SectionTitleIcon>
              <SectionTitleText fontSize={62}>Every Bell, Whistle, and Moo</SectionTitleText>
              <SectionTitleDescription fontSize={24} color={Color.neutral40}>
                With the CoW Swap widget, you can offer your users everything you know and love about CoW Swap, and
                more. Oh, and yes… it does come with the “moo”.
              </SectionTitleDescription>
            </SectionTitleWrapper>

            <TopicList columns={3}>
              <TopicCard contentAlign={'left'} bgColor={Color.neutral100} padding={'32px'} gap={16} asProp="div">
                <TopicImage bgColor="transparent" height={75} width={'auto'}>
                  <SVG src="images/protection.svg" />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicTitle>Full Protection from MEV</TopicTitle>
                  <TopicDescription fontSize={18} color={Color.neutral40} margin="0">
                    CoW Swap offers the best MEV protection in the land. Thanks to a delegated trading model that relies
                    on experts to execute swaps, traders can rest assured that they're safe from the MEV bots.
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor={Color.neutral100} padding={'32px'} gap={16} asProp="div">
                <TopicImage bgColor="transparent" height={75} width={'auto'}>
                  <SVG src="images/surplus.svg" />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicTitle>Surplus-Capturing Orders</TopicTitle>
                  <TopicDescription fontSize={18} color={Color.neutral40} margin="0">
                    Every order is surplus-capturing and traders usually earn a little extra in their sell token with
                    each swap.
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor={Color.neutral100} padding={'32px'} gap={16} asProp="div">
                <TopicImage bgColor="transparent" height={75} width={'auto'}>
                  <SVG src="images/gasless.svg" />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicTitle>Gasless Trading</TopicTitle>
                  <TopicDescription fontSize={18} color={Color.neutral40} margin="0">
                    All gas fees are paid in the sell token for swaps and even for token approvals. Users can enjoy
                    ETH-free trading every time, even with brand-new wallets.
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={Color.neutral100} color={Color.neutral10}>
          <ContainerCardSection>
            <SectionTitleWrapper maxWidth={900}>
              <SectionTitleIcon size={60}>
                <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly />
              </SectionTitleIcon>
              <SectionTitleText fontSize={62}>Everything You'd Want in a Widget</SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={4} columnsMobile={1}>
              {FEATURE_ITEMS.map((item, index) => (
                <TopicCard
                  key={index}
                  contentAlign={'left'}
                  bgColor={Color.neutral90}
                  padding={'24px'}
                  gap={12}
                  asProp="div"
                >
                  <TopicImage bgColor="transparent" height={42} width={'auto'}>
                    <SVG src="images/icons/check-color.svg" />
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

        <ContainerCard bgColor={Color.neutral10} color={Color.neutral98}>
          <ContainerCardSection>
            <SectionTitleWrapper>
              <SectionTitleIcon multiple>
                <SVG src={IMG_ICON_OWL} />
                <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly height={60} />
                <SVG src={IMG_ICON_GHOST} />
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
                    bgColor={Color.neutral20}
                    padding={'10px'}
                    href={dao.link}
                  >
                    <TopicImage
                      iconColor={Color.neutral0}
                      bgColor={'transparent'}
                      width={'100%'}
                      height={48}
                      margin={'auto'}
                    >
                      {isPng ? (
                        <img src={dao.icon} alt={dao.title} style={{ maxWidth: '100%' }} />
                      ) : (
                        <SVG src={dao.icon} />
                      )}
                    </TopicImage>
                  </TopicCard>
                )
              })}
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'} color={Color.neutral10} padding="0">
          <ContainerCardSection padding={'0'}>
            <SectionTitleWrapper>
              <SectionTitleIcon>
                <SVG src={IMG_ICON_FAQ} />
              </SectionTitleIcon>
              <SectionTitleText>FAQs</SectionTitleText>
            </SectionTitleWrapper>

            <FAQ faqs={FAQ_DATA} />
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={Color.neutral90} color={Color.neutral10} touchFooter>
          <ContainerCardSection padding={'0'}>
            <SectionTitleWrapper maxWidth={1000} margin="0 auto">
              <SectionTitleDescription fontSize={16} color={Color.neutral40}>
                <b>* Important Disclaimer:</b> Use of this widget is subject to the laws and regulations of your
                jurisdiction. You are solely responsible for ensuring compliance, and the provider is not liable for any
                legal consequences or issues arising from your failure to adhere. Using the widget indicates acceptance
                of the <a href="/widget/terms-and-conditions">Terms and Conditions;</a> if you do not agree, refrain
                from using it.
              </SectionTitleDescription>
            </SectionTitleWrapper>
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
