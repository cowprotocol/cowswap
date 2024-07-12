import { useEffect } from 'react'

import { GetStaticProps } from 'next'
import { Color, ProductLogo, ProductVariant } from '@cowprotocol/ui'

import IMG_ICON_UNICORN from '@cowprotocol/assets/images/icon-unicorn.svg'
import IMG_ICON_FLOWER_COW from '@cowprotocol/assets/images/icon-flower-cow.svg'
import IMG_COWSWAP_HERO from '@cowprotocol/assets/images/image-cowswap-hero.svg'
import ICON_BULB from '@cowprotocol/assets/images/icon-bulb-cow.svg'

import Layout from '@/components/Layout'
import FAQ from '@/components/FAQ'
import { Link, LinkType } from '@/components/Link'

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
import { FAQ_DATA, TWEETS, COW_IS_DIFFERENT, ADVANCED_ORDER_TYPES, BETTER_UX } from '@/data/cow-swap/const'
import { CONFIG, DATA_CACHE_TIME_SECONDS } from '@/const/meta'
import LazyLoadTweet from '@/components/LazyLoadTweet'
import { clickOnCowSwap } from 'modules/analytics'

interface PageProps {
  siteConfigData: typeof CONFIG
  tweets: string[]
}

export default function Page({ tweets }: PageProps) {
  // Load Twitter script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://platform.twitter.com/widgets.js'
    script.async = true
    document.head.appendChild(script)
  }, [])

  return (
    <Layout
      bgColor={Color.neutral90}
      metaTitle="CoW Swap - Don't worry, trade happy"
      metaDescription="CoW Swap protects traders from the dangers of DeFi, so you can do what you want without needing to worry"
      ogImage={CONFIG.ogImageCOWSWAPP}
    >
      <PageWrapper>
        <HeroContainer variant="secondary">
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
              onClick={() => clickOnCowSwap('click-launch-app')}
            >
              Launch app
            </Link>
          </HeroContent>
          <HeroImage width={470} height={470} color={'#012F7A'} marginMobile="24px auto 56px">
            <SVG src={IMG_COWSWAP_HERO} />
          </HeroImage>
        </HeroContainer>

        <MetricsCard bgColor="#65D9FF" color="#012F7A" columns={3} touchFooter>
          <MetricsItem dividerColor="#005EB7">
            <h2>#1</h2>
            <p>retention rate of all major DEXs</p>
          </MetricsItem>
          <MetricsItem dividerColor="#005EB7">
            <h2>$44B+</h2>
            <p>total volume traded</p>
          </MetricsItem>
          <MetricsItem>
            <h2>$238M+</h2>
            <p>surplus found for users</p>
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
            onClick={() => clickOnCowSwap('click-metrics-link')}
          >
            View all metrics on DUNE &#8599;
          </Link>
        </MetricsCard>

        <ContainerCard bgColor={Color.neutral100}>
          <ContainerCardSection gap={90}>
            <SectionTitleWrapper color={Color.neutral10} maxWidth={1100} gap={56}>
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

            <TopicList columns={3} columnsTablet={2}>
              {COW_IS_DIFFERENT.map((topic, index) => (
                <TopicCard key={index} contentAlign={'left'} bgColor={topic.bgColor} padding={'32px'} asProp="div">
                  <TopicCardInner contentAlign="left">
                    <TopicDescription fontSize={topic.fontSize} color={topic.color}>
                      {topic.description}
                    </TopicDescription>
                  </TopicCardInner>
                  <TopicImage
                    iconColor={'transparent'}
                    bgColor="transparent"
                    margin={'auto 0 0 auto'}
                    height={187}
                    width={'auto'}
                  >
                    <SVG src={topic.imgSrc} />
                  </TopicImage>
                </TopicCard>
              ))}
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'}>
          <ContainerCardSection>
            <SectionTitleWrapper maxWidth={800}>
              <SectionTitleIcon size={126}>
                <SVG src={ICON_BULB} />
              </SectionTitleIcon>
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
                onClick={() => clickOnCowSwap('click-learn-about-cow-protocol')}
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
                CoW Swap features the smoothest trading experiences in DeFi, allowing you to worry less and do more.
              </SectionTitleDescription>
            </SectionTitleWrapper>

            <SectionTitleWrapper>
              <SectionTitleText>Advanced order types</SectionTitleText>
            </SectionTitleWrapper>
            <TopicList columns={3} columnsTablet={2}>
              {ADVANCED_ORDER_TYPES.map((topic, index) => (
                <TopicCard
                  key={index}
                  contentAlign={'left'}
                  bgColor={topic.bgColor}
                  textColor={topic.textColor}
                  padding={'32px'}
                  asProp="div"
                >
                  <TopicCardInner contentAlign="left">
                    <TopicTitle color={topic.titleColor}>{topic.title}</TopicTitle>
                    <TopicDescription fontSize={21}>{topic.description}</TopicDescription>
                  </TopicCardInner>
                  <TopicImage
                    iconColor="transparent"
                    bgColor="transparent"
                    margin={'auto 0 0 auto'}
                    height={187}
                    width={'auto'}
                  >
                    <SVG src={topic.imgSrc} />
                  </TopicImage>
                </TopicCard>
              ))}
            </TopicList>

            <SectionTitleWrapper>
              <SectionTitleText fontSize={51} textAlign="center">
                Better UX, thanks to intents
              </SectionTitleText>
            </SectionTitleWrapper>
            <TopicList columns={3} columnsTablet={2}>
              {BETTER_UX.map((topic, index) => (
                <TopicCard
                  key={index}
                  contentAlign={'left'}
                  bgColor={topic.bgColor}
                  textColor={topic.textColor}
                  padding={'32px'}
                  asProp="div"
                >
                  <TopicCardInner contentAlign="left">
                    <TopicTitle color={topic.titleColor}>{topic.title}</TopicTitle>
                    <TopicDescription fontSize={21}>{topic.description}</TopicDescription>
                  </TopicCardInner>
                  <TopicImage
                    iconColor="transparent"
                    bgColor="transparent"
                    margin={'auto 0 0 auto'}
                    height={187}
                    width={'auto'}
                  >
                    <SVG src={topic.imgSrc} />
                  </TopicImage>
                </TopicCard>
              ))}
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

            <TopicList columns={4} columnsTablet={2}>
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

            <TopicList columns={3} columnsTablet={2} maxWidth={1360}>
              {tweets.map((tweet, index) => (
                <TopicCard
                  bgColor={Color.neutral100}
                  padding="4px"
                  paddingMobile="4px"
                  gap={16}
                  asProp="div"
                  key={index}
                >
                  <TopicCardInner minHeight={'200px'} contentAlign={'center'}>
                    <LazyLoadTweet tweetUrl={tweet} key={index} />
                  </TopicCardInner>
                </TopicCard>
              ))}
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
                onClick={() => clickOnCowSwap('click-launch-app')}
              >
                Launch app
              </Link>
            </SectionTitleWrapper>
          </ContainerCardSection>
        </ContainerCard>
      </PageWrapper>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const siteConfigData = CONFIG
  const tweets = TWEETS

  return {
    props: {
      siteConfigData,
      tweets,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
