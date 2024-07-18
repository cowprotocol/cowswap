import { GetStaticProps } from 'next'
import { Color, ProductLogo, ProductVariant } from '@cowprotocol/ui'
import IMG_ICON_CROWN_COW from '@cowprotocol/assets/images/icon-crown-cow.svg'
import IMG_ICON_BULB_COW from '@cowprotocol/assets/images/icon-bulb-cow.svg'
import IMG_COWAMM_HERO from '@cowprotocol/assets/images/image-cowamm-hero.svg'
import IMG_COWAMM_RAISING from '@cowprotocol/assets/images/image-cowamm-raising.svg'
import IMG_COWAMM_PASSIVE from '@cowprotocol/assets/images/image-cowamm-passive.svg'
import IMG_COWAMM_REKT from '@cowprotocol/assets/images/image-cowamm-rekt.svg'

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

import { FAQ_DATA, QUOTES, LVR_CONTENT, COW_AMM_CONTENT } from '@/data/cow-amm/const'

import { CONFIG, DATA_CACHE_TIME_SECONDS } from '@/const/meta'
import { clickOnCowAmm } from 'modules/analytics'

interface PageProps {
  siteConfigData: typeof CONFIG
}

export default function Page() {
  return (
    <Layout
      bgColor={Color.neutral90}
      metaTitle="CoW AMM - The first MEV-capturing AMM"
      metaDescription="CoW AMM protects LPs from LVR so they can provide liquidity with less risk and more return"
      ogImage={CONFIG.ogImageCOWAMM}
    >
      <PageWrapper>
        <HeroContainer variant="secondary" maxWidth={1300}>
          <HeroContent variant="secondary">
            <HeroSubtitle color={'#194D05'}>CoW AMM</HeroSubtitle>
            <HeroTitle>The first MEV-capturing AMM</HeroTitle>
            <HeroDescription>
              CoW AMM protects LPs from LVR so they can provide liquidity with less risk and more return
            </HeroDescription>
            <Link
              bgColor={'#194D05'}
              color={'#BCEC79'}
              href="https://deploy-cow-amm.bleu.fi/"
              external
              linkType={LinkType.HeroButton}
              utmContent={'cow-amm-hero-button-protect-liquidity'}
              onClick={() => clickOnCowAmm('click-protect-liquidity')}
            >
              Protect your liquidity
            </Link>
          </HeroContent>
          <HeroImage width={470} height={470} color={'#194D05'} marginMobile="24px auto 56px">
            <SVG src={IMG_COWAMM_HERO} />
          </HeroImage>
        </HeroContainer>

        <MetricsCard bgColor={Color.neutral100} color="#194D05" columns={3} touchFooter>
          <MetricsItem dividerColor="#9BD955">
            <h2>3%</h2>
            <p>performance improvement over reference pool</p>
          </MetricsItem>
          <MetricsItem dividerColor="#9BD955">
            <h2>$4.8M+</h2>
            <p>liquidity protected from LVR</p>
          </MetricsItem>
          <MetricsItem>
            <h2>$59K+</h2>
            <p>surplus captured for LPs</p>
          </MetricsItem>

          <Link
            bgColor="transparent"
            color="#194D05"
            margin="56px auto 0"
            gridFullWidth
            href="https://dune.com/cowprotocol/cowamms"
            external
            linkType={LinkType.SectionTitleButton}
            utmContent={'cow-amm-metrics-button-view-all'}
            onClick={() => clickOnCowAmm('click-view-all-metrics')}
          >
            View all metrics on DUNE &#8599;
          </Link>
        </MetricsCard>

        <ContainerCard bgColor={Color.neutral10}>
          <ContainerCardSection>
            <SectionTitleWrapper color={Color.neutral100} maxWidth={1100} gap={56}>
              <SectionTitleIcon size={98}>
                <SVG src={IMG_ICON_CROWN_COW} />
              </SectionTitleIcon>
              <SectionTitleText>AMMs don&apos;t want you to know about LVR</SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={1} columnsTablet={1} maxWidth={1470}>
              {LVR_CONTENT.map((content, index) => (
                <TopicCard
                  key={index}
                  columns="1fr auto"
                  columnsTablet="1fr"
                  gap={100}
                  horizontal
                  asProp="div"
                  bgColor={content.bgColor}
                  paddingMobile="0"
                >
                  <TopicCardInner contentAlign="left">
                    <TopicDescription fontSize={28} color={Color.neutral95}>
                      {content.description1}
                    </TopicDescription>
                    <TopicDescription fontSize={21} color={Color.neutral50}>
                      <sup>1</sup> {content.description2}
                    </TopicDescription>
                  </TopicCardInner>
                  <TopicImage
                    iconColor="transparent"
                    width={590}
                    height={590}
                    heightMobile={300}
                    orderReverseMobile
                    orderReverseTablet
                    borderRadius={90}
                  >
                    <SVG src={content.image} />
                  </TopicImage>
                </TopicCard>
              ))}
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'}>
          <ContainerCardSection>
            <SectionTitleWrapper padding="150px 0 0" marginMobile="0 auto" maxWidth={1170} color={Color.neutral10}>
              <SectionTitleIcon size={128}>
                <SVG src={IMG_ICON_BULB_COW} />
              </SectionTitleIcon>
              <SectionTitleText textAlign="center">Finally, an AMM designed with LPs in mind</SectionTitleText>
              <SectionTitleDescription textAlign="center">
                CoW AMM eliminates LVR once and for all by using batch auctions to send surplus to LPs
              </SectionTitleDescription>
            </SectionTitleWrapper>

            <TopicList columns={4} columnsTablet={2}>
              {COW_AMM_CONTENT.map((content, index) => (
                <TopicCard
                  key={index}
                  gap={0}
                  contentAlign="left"
                  bgColor={content.bgColor}
                  textColor={content.textColor}
                  padding="24px"
                  asProp="div"
                >
                  <TopicCardInner contentAlign="left">
                    <TopicDescription fontSize={21} fontSizeMobile={21}>
                      <b>{index + 1}.</b>
                      <br />
                      {content.description}
                    </TopicDescription>
                  </TopicCardInner>
                  <TopicImage
                    iconColor="transparent"
                    bgColor="transparent"
                    height="auto"
                    width="100%"
                    margin="auto 0 0 auto"
                  >
                    <SVG src={content.image} />
                  </TopicImage>
                </TopicCard>
              ))}
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={Color.neutral100}>
          <ContainerCardSection>
            <SectionTitleWrapper color={Color.neutral10} maxWidth={1100} gap={56}>
              <SectionTitleIcon size={98}>
                <SVG src={IMG_ICON_CROWN_COW} />
              </SectionTitleIcon>
              <SectionTitleText>
                Raising the <s>bar</s> curve
              </SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={1} columnsTablet={1} maxWidth={1470}>
              <TopicCard
                columns="1fr auto"
                columnsTablet="1fr"
                gap={100}
                horizontal
                asProp="div"
                bgColor="transparent"
                paddingMobile="0"
              >
                <TopicCardInner contentAlign="left">
                  <TopicDescription fontSize={28}>
                    CoW AMM LPs don't have to worry about LVR, which costs CF-AMM LPs 5-7% of their liquidity, on
                    average.
                    <br />
                    <br />
                    Backtesting research conducted over 6 months in 2023 shows that CoW AMM returns would have equalled
                    or outperformed CF-AMM returns for 10 of the 11 most liquid, non-stablecoin pairs.
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor="transparent"
                  width={550}
                  height={550}
                  heightMobile={300}
                  orderReverseMobile
                  orderReverseTablet
                  borderRadius={32}
                >
                  <SVG src={IMG_COWAMM_RAISING} />
                </TopicImage>
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'}>
          <ContainerCardSection>
            <SectionTitleWrapper color={Color.neutral10} maxWidth={1100} gap={56}>
              <SectionTitleIcon size={128}>
                <SVG src={IMG_ICON_BULB_COW} />
              </SectionTitleIcon>
              <SectionTitleText>CoW AMM benefits LPs of all types</SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={1} columnsTablet={1} maxWidth={1470}>
              <TopicCard
                columns="1fr auto"
                columnsTablet="1fr"
                gap={100}
                horizontal
                asProp="div"
                bgColor="transparent"
                paddingMobile="0"
              >
                <TopicImage
                  iconColor="transparent"
                  width={500}
                  height={500}
                  heightMobile={300}
                  orderReverseMobile
                  orderReverseTablet
                  borderRadius={32}
                >
                  <SVG src={IMG_COWAMM_REKT} />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={52}>Provide liquidity for your token without getting rekt</TopicTitle>
                  <TopicDescription fontSize={24} color={Color.neutral50}>
                    Healthy liquidity for DAO tokens reduces price impact, encourages investment and discourages
                    volatility. But DAOs can be reluctant to provide liquidity with treasury funds when their pools can
                    be exploited by arbitrageurs. CoW AMM makes providing liquidity more attractive to DAOs of all
                    sizes.
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard
                columns="1fr auto"
                columnsTablet="1fr"
                gap={100}
                horizontal
                asProp="div"
                bgColor="transparent"
                paddingMobile="0"
              >
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={52}>Unlock the power of passive income</TopicTitle>
                  <TopicDescription fontSize={24} color={Color.neutral50}>
                    With LVR in the rear view mirror, providing liquidity becomes identical to running a passive
                    investment strategy: solvers rebalance the pool at the correct market price to keep the value of its
                    reserves equal, thereby keeping portfolios balanced and reducing risk.
                  </TopicDescription>
                </TopicCardInner>
                <TopicImage
                  iconColor="transparent"
                  width={500}
                  height={500}
                  heightMobile={300}
                  orderReverseMobile
                  orderReverseTablet
                  borderRadius={32}
                >
                  <SVG src={IMG_COWAMM_PASSIVE} />
                </TopicImage>
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={Color.neutral10} color={Color.neutral98}>
          <ContainerCardSection>
            <SectionTitleWrapper padding="150px 0 56px">
              <SectionTitleIcon size={82}>
                <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly />
              </SectionTitleIcon>
              <SectionTitleText>Trust the experts</SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={3} columnsTablet={2}>
              {QUOTES.map((quote, index) => (
                <TopicCard
                  key={index}
                  contentAlign="left"
                  bgColor={quote.bgColor}
                  textColor={quote.textColor}
                  padding="24px"
                  asProp="div"
                >
                  <TopicCardInner height="100%" contentAlign="left" gap={52}>
                    <TopicTitle fontSize={28}>{quote.title}</TopicTitle>
                    <TopicDescription margin="auto 0 0" fontSize={21}>
                      {quote.description}
                    </TopicDescription>
                  </TopicCardInner>
                </TopicCard>
              ))}
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={Color.neutral90} color={Color.neutral10} touchFooter>
          <ContainerCardSection padding={'0 0 100px'}>
            <SectionTitleWrapper>
              <SectionTitleIcon size={62}>
                <SVG src={IMG_ICON_FAQ} />
              </SectionTitleIcon>
              <SectionTitleText>FAQs</SectionTitleText>
            </SectionTitleWrapper>

            <FAQ faqs={FAQ_DATA} />
          </ContainerCardSection>
        </ContainerCard>
      </PageWrapper>
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
