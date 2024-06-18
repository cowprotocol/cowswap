import { GetStaticProps } from 'next'
import { Color, ProductLogo, ProductVariant } from '@cowprotocol/ui'

import IMG_ICON_UNICORN from '@cowprotocol/assets/images/icon-unicorn.svg'
import IMG_ICON_FLOWER_COW from '@cowprotocol/assets/images/icon-flower-cow.svg'

import styled from 'styled-components'

import { CONFIG } from '@/const/meta'

import Layout from '@/components/Layout'
import FAQ from '@/components/FAQ'
import { Link, LinkType } from '@/components/Link'

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
  HeroImage,
  HeroDescription,
  HeroContent,
  HeroTitle,
  HeroSubtitle,
  MetricsCard,
  MetricsItem,
} from '@/styles/styled'

import SVG from 'react-inlinesvg'
import IMG_ICON_FAQ from '@cowprotocol/assets/images/icon-faq.svg'
import { FAQ_DATA } from './const'

import { GAEventCategories } from 'lib/analytics/GAEvents'
import { sendGAEventHandler } from 'lib/analytics/sendGAEvent'

const DATA_CACHE_TIME_SECONDS = 5 * 60 // Cache 5min

interface PageProps {
  siteConfigData: typeof CONFIG
}

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  max-width: 1760px;
  width: 100%;
  margin: 76px auto 0;
  gap: 24px;
`

export default function Page({ siteConfigData }: PageProps) {
  return (
    <Layout
      bgColor={Color.neutral90}
      metaTitle="CoW Swap - Don't worry, trade happy"
      metaDescription="CoW Swap protects traders from the dangers of DeFi, so you can do what you want without needing to worry"
    >
      <Wrapper>
        <HeroContainer variant="secondary" maxWidth={1350} padding="0 20px 90px">
          <HeroContent variant="secondary">
            <HeroSubtitle color={'#012F7A'}>CoW Swap</HeroSubtitle>
            <HeroTitle>
              Don't worry,
              <br /> trade happy
            </HeroTitle>
            <HeroDescription>
              CoW Swap protects traders from the dangers of DeFi, so you can do what you want without needing to worry
            </HeroDescription>
            <Link
              bgColor={'#012F7A'}
              color={'#65D9FF'}
              href="https://swap.cow.fi/"
              external
              linkType={LinkType.HeroButton}
              utmContent="cow-swap-launch-app-button"
              onClick={() => sendGAEventHandler(GAEventCategories.COWSWAP, 'click-launch-app')}
            >
              Launch app
            </Link>
          </HeroContent>
          <HeroImage width={470} height={470} color={'#012F7A'} marginMobile="24px auto 56px">
            <ProductLogo height="100%" variant={ProductVariant.CowSwap} theme="light" logoIconOnly />
          </HeroImage>
        </HeroContainer>

        <MetricsCard bgColor="#65D9FF" color="#012F7A" columns={3} touchFooter>
          <MetricsItem dividerColor="#005EB7">
            <h2>$44B+</h2>
            <p>total volume traded</p>
          </MetricsItem>
          <MetricsItem dividerColor="#005EB7">
            <h2>$238M+</h2>
            <p>surplus found for users</p>
          </MetricsItem>
          <MetricsItem>
            <h2>#1</h2>
            <p>retention rate of all DEXs</p>
          </MetricsItem>

          <Link
            bgColor="transparent"
            color="#012F7A"
            margin="24px auto 0"
            gridFullWidth
            href="https://dune.com/cowprotocol/cowswap"
            external
            linkType={LinkType.SectionTitleButton}
            utmContent="cow-swap-metrics-link"
            onClick={() => sendGAEventHandler(GAEventCategories.COWSWAP, 'click-metrics-link')}
          >
            View all metrics on DUNE &#8599;
          </Link>
        </MetricsCard>

        <ContainerCard bgColor={Color.neutral100}>
          <ContainerCardSection gap={90}>
            <SectionTitleWrapper color={Color.neutral0} maxWidth={1100} gap={56}>
              <SectionTitleIcon multiple size={82}>
                <SVG src={IMG_ICON_UNICORN} />
                <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly />
                <SVG src={IMG_ICON_UNICORN} className="image-reverse" />
              </SectionTitleIcon>

              <SectionTitleText>CoW Swap is different</SectionTitleText>
              <SectionTitleDescription maxWidth={900} color={Color.neutral50}>
                Unlike other exchanges, CoW Swap is built around frequent batch auctions, which are designed to find the
                best liquidity at any point in time and protect you from MEV
              </SectionTitleDescription>
            </SectionTitleWrapper>

            <TopicList columns={3}>
              <TopicCard contentAlign={'left'} bgColor={Color.neutral90} padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicDescription fontSize={28} color={Color.neutral10}>
                    By aligning incentives, CoW Swap finds surplus you won't get anywhere else
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor={Color.neutral70}
                  bgColor="transparent"
                  margin={'0 0 0 auto'}
                  height={187}
                  width={'auto'}
                >
                  <ProductLogo variant={ProductVariant.CowSwap} logoIconOnly theme="light" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor={Color.neutral90} padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicDescription fontSize={28} color={Color.neutral10}>
                    MEV is a $1.3+ billion problem that you never have to worry about on CoW Swap
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor={Color.neutral70}
                  bgColor="transparent"
                  margin={'0 0 0 auto'}
                  height={187}
                  width={'auto'}
                >
                  <ProductLogo variant={ProductVariant.CowSwap} logoIconOnly theme="light" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor={Color.neutral90} padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicDescription fontSize={28} color={Color.neutral10}>
                    CoW Swap's unique architecture enables advanced order types and seamless UX
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor={Color.neutral70}
                  bgColor="transparent"
                  margin={'0 0 0 auto'}
                  height={187}
                  width={'auto'}
                >
                  <ProductLogo variant={ProductVariant.CowSwap} logoIconOnly theme="light" />
                </TopicImage>
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'}>
          <ContainerCardSection>
            <SectionTitleWrapper maxWidth={800}>
              <SectionTitleText>CoW Swap is the first user interface built on top of CoW Protocol</SectionTitleText>
              <SectionTitleDescription color={Color.neutral50}>
                A powerful, open-source, and permissionless DEX aggregation protocol that anyone can integrate for a
                variety of DeFi purposes
              </SectionTitleDescription>
              <Link
                bgColor="#65D9FF"
                color="#012F7A"
                href="/cow-protocol"
                linkType={LinkType.SectionTitleButton}
                onClick={() => sendGAEventHandler(GAEventCategories.COWSWAP, 'click-learn-about-cow-protocol')}
              >
                Learn about CoW Protocol
              </Link>
            </SectionTitleWrapper>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={Color.neutral10} color={Color.neutral98}>
          <ContainerCardSection>
            <SectionTitleWrapper padding="150px 0 0" maxWidth={900}>
              <SectionTitleIcon size={140}>
                <SVG src={IMG_ICON_FLOWER_COW} />
              </SectionTitleIcon>
              <SectionTitleText>S-moooo-th trading</SectionTitleText>
              <SectionTitleDescription color={Color.neutral60}>
                CoW Swap features the smoothest trading experiences in DeFi, allowing you to worry less and do more
              </SectionTitleDescription>
            </SectionTitleWrapper>

            <SectionTitleWrapper>
              <SectionTitleText>Advanced order types</SectionTitleText>
            </SectionTitleWrapper>
            <TopicList columns={3}>
              <TopicCard contentAlign={'left'} bgColor="#012F7A" textColor="#65D9FF" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100}>Market orders (aka swaps)</TopicTitle>
                  <TopicDescription fontSize={21} color="#65D9FF">
                    CoW Swap market orders maximize surplus and minimize MEV
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor="#004293"
                  bgColor="transparent"
                  margin={'auto 0 0 auto'}
                  height={187}
                  width={'auto'}
                >
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#012F7A" textColor="#65D9FF" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100}>Limit orders</TopicTitle>
                  <TopicDescription fontSize={21} color="#65D9FF">
                    Placing a limit order is like setting a trap for a price for your trade. CoW Swap is the only DEX
                    that offers surplus on limit orders – and one of the only DEXs that offers limit orders at all
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor="#004293"
                  bgColor="transparent"
                  margin={'auto 0 0 auto'}
                  height={187}
                  width={'auto'}
                >
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#012F7A" textColor="#65D9FF" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100}>TWAP orders</TopicTitle>
                  <TopicDescription fontSize={21} color="#65D9FF">
                    Time-weighted average price (TWAP) orders minimize price impact and volatility risk by letting you
                    trade assets at fixed intervals over a period of time
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor="#004293"
                  bgColor="transparent"
                  margin={'auto 0 0 auto'}
                  height={187}
                  width={'auto'}
                >
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>
            </TopicList>

            <SectionTitleWrapper>
              <SectionTitleText fontSize={51} textAlign="center">
                Seamless UX
              </SectionTitleText>
            </SectionTitleWrapper>
            <TopicList columns={3}>
              <TopicCard contentAlign={'left'} bgColor="#012F7A" textColor="#65D9FF" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100}>Gasless trading</TopicTitle>
                  <TopicDescription fontSize={21} color="#65D9FF">
                    All gas fees are paid in the sell token - so you can save your precious ETH
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor="#004293"
                  bgColor="transparent"
                  margin={'auto 0 0 auto'}
                  height={187}
                  width={'auto'}
                >
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#012F7A" textColor="#65D9FF" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100}>No fees for failed transactions</TopicTitle>
                  <TopicDescription fontSize={21} color="#65D9FF">
                    You shouldn&apos;t pay for what didn&apos;t work, so failed transactions are always free
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor="#004293"
                  bgColor="transparent"
                  margin={'auto 0 0 auto'}
                  height={187}
                  width={'auto'}
                >
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#012F7A" textColor="#65D9FF" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100}>Execute multiple trades at once</TopicTitle>
                  <TopicDescription fontSize={21} color="#65D9FF">
                    With intent-based trading, you can place as many orders as you want simultaneously
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor="#004293"
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
            <SectionTitleWrapper padding="150px 0 0" maxWidth={1300}>
              <SectionTitleIcon size={82}>
                <ProductLogo variant={ProductVariant.CowProtocol} theme="light" logoIconOnly />
              </SectionTitleIcon>
              <SectionTitleText textAlign="center">The DEX of choice for crypto whales and pros</SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={4}>
              <TopicCard
                contentAlign={'left'}
                bgColor="#012F7A"
                textColor={Color.neutral100}
                padding={'32px'}
                asProp="div"
              >
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100} fontSize={51}>
                    $2,500
                  </TopicTitle>
                  <TopicDescription fontSize={21} color="#65D9FF">
                    Average trade size (more than 2x Uniswap&apos;s)
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard
                contentAlign={'left'}
                bgColor="#012F7A"
                textColor={Color.neutral100}
                padding={'32px'}
                asProp="div"
              >
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100} fontSize={51}>
                    39%
                  </TopicTitle>
                  <TopicDescription fontSize={21} color="#65D9FF">
                    Market share among smart contract wallets
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard
                contentAlign={'left'}
                bgColor="#012F7A"
                textColor={Color.neutral100}
                padding={'32px'}
                asProp="div"
              >
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100} fontSize={51}>
                    42%
                  </TopicTitle>
                  <TopicDescription fontSize={21} color="#65D9FF">
                    Monthly user retention rate – the highest in DeFi
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard
                contentAlign={'left'}
                bgColor="#012F7A"
                textColor={Color.neutral100}
                padding={'32px'}
                asProp="div"
              >
                <TopicCardInner contentAlign="left">
                  <TopicTitle color={Color.neutral100} fontSize={51}>
                    #1
                  </TopicTitle>
                  <TopicDescription fontSize={21} color="#65D9FF">
                    Intents-based trading platform
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'}>
          <ContainerCardSection>
            <SectionTitleWrapper maxWidth={1100}>
              <SectionTitleText textAlign="center">Don't take our word for it</SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={3} maxWidth={1360}>
              <TopicCard bgColor={Color.neutral100} padding="4px" paddingMobile="4px" gap={16} asProp="div">
                <TopicCardInner>
                  <blockquote className="twitter-tweet" data-dnt="true">
                    <a href="https://twitter.com/koeppelmann/status/1729455013007684035">Loading X...</a>
                  </blockquote>
                </TopicCardInner>
              </TopicCard>

              <TopicCard bgColor={Color.neutral100} padding="4px" paddingMobile="4px" gap={16} asProp="div">
                <TopicCardInner>
                  <blockquote className="twitter-tweet" data-dnt="true">
                    <a href="https://twitter.com/nomos_paradox/status/1738489297815142736">Loading X...</a>
                  </blockquote>
                </TopicCardInner>
              </TopicCard>

              <TopicCard bgColor={Color.neutral100} padding="4px" paddingMobile="4px" gap={16} asProp="div">
                <TopicCardInner>
                  <blockquote className="twitter-tweet" data-dnt="true">
                    <a href="https://twitter.com/passivenodeinc1/status/1485204781153107973">Loading X...</a>
                  </blockquote>
                </TopicCardInner>
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'} color={Color.neutral10}>
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

        <ContainerCard bgColor={Color.neutral90} color={Color.neutral10} touchFooter>
          <ContainerCardSection padding={'0 0 100px'}>
            <SectionTitleWrapper margin="0 auto">
              <SectionTitleIcon>
                <ProductLogo variant={ProductVariant.CowSwap} theme="light" logoIconOnly />
              </SectionTitleIcon>
              <SectionTitleText>Don't worry, trade happy</SectionTitleText>
              <SectionTitleDescription fontSize={28} color={Color.neutral30}>
                Trade seamlessly, with the most user-protective DEX in DeFi
              </SectionTitleDescription>
              <Link
                bgColor="#65D9FF"
                color="#012F7A"
                href="https://swap.cow.fi/"
                external
                linkType={LinkType.SectionTitleButton}
                utmContent="cow-swap-launch-app-button"
                onClick={() => sendGAEventHandler(GAEventCategories.COWSWAP, 'click-launch-app')}
              >
                Launch app
              </Link>
            </SectionTitleWrapper>
          </ContainerCardSection>
        </ContainerCard>
      </Wrapper>

      <script async src="https://platform.twitter.com/widgets.js"></script>
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
