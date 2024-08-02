import { GetStaticProps } from 'next'
import { Color, ProductLogo, ProductVariant } from '@cowprotocol/ui'
import IMG_ICON_CROWN_COW from '@cowprotocol/assets/images/icon-crown-cow.svg'

import IMG_ICON_BULB_COW from '@cowprotocol/assets/images/icon-bulb-cow.svg'

import IMG_ICON_OWL from '@cowprotocol/assets/images/icon-owl.svg'
import IMG_ICON_GHOST from '@cowprotocol/assets/images/icon-ghost.svg'

import Layout from '@/components/Layout'
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
  TrustedBy,
  SwiperSlideWrapper,
} from '@/styles/styled'

import { DAO_CONTENT as CONTENT } from '@/data/widget/const'

import SVG from 'react-inlinesvg'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'

import { CONFIG, DATA_CACHE_TIME_SECONDS } from '@/const/meta'
import { clickOnDaos } from 'modules/analytics'

interface PageProps {
  siteConfigData: typeof CONFIG
}

export default function Page() {
  return (
    <Layout
      bgColor={Color.neutral90}
      metaTitle="DAOs - Savvy DAOs Choose CoW Swap"
      metaDescription="The smartest DAOs trust CoW Swap with their most-important trades"
    >
      <PageWrapper>
        <HeroContainer variant="secondary">
          <HeroContent variant="secondary">
            <HeroSubtitle color={'#66018E'}>DAOs</HeroSubtitle>
            <HeroTitle maxWidth={470}>Savvy DAOs Choose CoW Swap</HeroTitle>
            <HeroDescription>The smartest DAOs trust CoW Swap with their most-important trades</HeroDescription>
          </HeroContent>
          <HeroImage width={470} height={400} color={'#66018E'}>
            <SVG src={IMG_ICON_BULB_COW} />
          </HeroImage>
        </HeroContainer>

        <MetricsCard bgColor="#F996EE" color="#66018E" columns={1} touchFooter>
          <TrustedBy>
            <p>Trusted by</p>
            <ul>
              {CONTENT.trustedDAOs.map(
                ({ icon, title, volume }, index) =>
                  volume && (
                    <li key={index}>
                      <SVG src={icon} title={title} />
                      <small>with</small>
                      <strong>{volume}</strong>
                    </li>
                  )
              )}
            </ul>
          </TrustedBy>
        </MetricsCard>

        <ContainerCard bgColor={Color.neutral10}>
          <ContainerCardSection>
            <SectionTitleWrapper color={Color.neutral100} maxWidth={1100} gap={56}>
              <SectionTitleIcon size={98}>
                <SVG src={IMG_ICON_CROWN_COW} />
              </SectionTitleIcon>
              <SectionTitleText>Expert trading for expert DAOs</SectionTitleText>
              <SectionTitleDescription maxWidth={900}>
                CoW Swap is the only DEX built to solve the unique challenges faced by DAOs
              </SectionTitleDescription>
            </SectionTitleWrapper>

            <SwiperSlideWrapper>
              <Swiper
                slidesPerView={'auto'}
                centeredSlides={true}
                grabCursor={true}
                loop={true}
                keyboard={{
                  enabled: true,
                }}
                pagination={{
                  dynamicBullets: true,
                  clickable: true,
                }}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: true,
                }}
                navigation={{
                  nextEl: '.swiper-button-next',
                  prevEl: '.swiper-button-prev',
                }}
                spaceBetween={50}
                modules={[Autoplay, Pagination, Navigation]}
                className="daoSwiper"
              >
                {CONTENT.slides.map((slide, index) => (
                  <SwiperSlide key={index}>
                    <img src={slide.image} alt={slide.title} />
                    <span>
                      <h4>{slide.title}</h4>
                      <p>{slide.description}</p>
                    </span>
                  </SwiperSlide>
                ))}
              </Swiper>

              <div className="swiper-button-prev"></div>
              <div className="swiper-button-next"></div>
            </SwiperSlideWrapper>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'} color={Color.neutral10}>
          <ContainerCardSection>
            <SectionTitleWrapper padding="150px 0 0" maxWidth={800}>
              <SectionTitleIcon size={60}>
                <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly />
              </SectionTitleIcon>
              <SectionTitleText>Advanced order types</SectionTitleText>
              <SectionTitleDescription fontSize={24} color={Color.neutral40}>
                CoW Swap's many order types help you get better prices for your trades, manage token launches,
                facilitate buybacks, and much more
              </SectionTitleDescription>
            </SectionTitleWrapper>

            <TopicList columns={3} columnsTablet={2}>
              <TopicCard contentAlign={'left'} bgColor={Color.neutral100} padding={'32px'} gap={16} asProp="div">
                <TopicImage bgColor="transparent" height={75} width={'auto'}>
                  <SVG src="images/icon-milkman.svg" />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicTitle>Milkman Orders</TopicTitle>
                  <TopicDescription fontSize={18} color={Color.neutral40} margin="0">
                    Ensure your trades are always close to the real-time market price thanks to the{' '}
                    <Link
                      href="https://github.com/charlesndalton/milkman"
                      external
                      utmContent="link-to-milkman"
                      onClick={() => clickOnDaos('click-milkman')}
                    >
                      Milkman bot
                    </Link>
                    . Set the maximum deviation you&apos;ll accept, and Milkman will do the rest.
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor={Color.neutral100} padding={'32px'} gap={16} asProp="div">
                <TopicImage bgColor="transparent" height={75} width={'auto'}>
                  <SVG src="images/icon-twap-orders.svg" />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicTitle>TWAP Orders</TopicTitle>
                  <TopicDescription fontSize={18} color={Color.neutral40} margin="0">
                    Time-weighted average price orders allow you to spread your trade out over time, averaging out your
                    trading price, minimizing price impact, and allowing for lower slippage.
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor={Color.neutral100} padding={'32px'} gap={16} asProp="div">
                <TopicImage bgColor="transparent" height={75} width={'auto'}>
                  <SVG src="images/icon-limit-orders.svg" />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicTitle>Limit Orders</TopicTitle>
                  <TopicDescription fontSize={18} color={Color.neutral40} margin="0">
                    CoW Swap's surplus-capturing limit orders allow you to set a price and sit back while your order
                    gets filled over time - perfect for token buybacks and other large trades.
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor={Color.neutral100} padding={'32px'} gap={16} asProp="div">
                <TopicImage bgColor="transparent" height={75} width={'auto'}>
                  <SVG src="images/icon-price-walls.svg" />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicTitle>Price Walls</TopicTitle>
                  <TopicDescription fontSize={18} color={Color.neutral40} margin="0">
                    Pick an asset, define a threshold price, and CoW Swap will automatically sell above the threshold,
                    and buy below it.
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor={Color.neutral100} padding={'32px'} gap={16} asProp="div">
                <TopicImage bgColor="transparent" height={75} width={'auto'}>
                  <SVG src="images/icon-basket-sells.svg" />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicTitle>Basket Sells</TopicTitle>
                  <TopicDescription fontSize={18} color={Color.neutral40} margin="0">
                    <Link
                      href="https://dump.services/"
                      external
                      utmContent="link-to-dump-services"
                      onClick={() => clickOnDaos('click-dump-services')}
                    >
                      Dump.services
                    </Link>
                    , a collaboration between CoW Swap and Yearn, allows DAOs and traders to sell multiple tokens in a
                    single transaction.
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor={Color.neutral100} padding={'32px'} gap={16} asProp="div">
                <TopicImage bgColor="transparent" height={75} width={'auto'}>
                  <SVG src="images/icon-logic.svg" />
                </TopicImage>
                <TopicCardInner contentAlign="left">
                  <TopicTitle>Place Your Logic Here</TopicTitle>
                  <TopicDescription fontSize={18} color={Color.neutral40} margin="0">
                    ERC-1271 Smart Orders and CoW Hooks allow you to define your own complex trading logic; if you can
                    think it, you can trade it.
                  </TopicDescription>
                </TopicCardInner>
              </TopicCard>
            </TopicList>

            <Link
              href="https://blog.cow.fi/list/advanced-order-types-b391bd4390cb"
              linkType={LinkType.SectionTitleButton}
              utmContent="link-to-advanced-order-types"
              margin="24px auto 0"
              external
              onClick={() => clickOnDaos('click-advanced-order-types')}
            >
              Explore advanced order types
            </Link>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={Color.neutral10} color={Color.neutral98} touchFooter>
          <ContainerCardSection>
            <SectionTitleWrapper padding="150px 0 0">
              <SectionTitleIcon multiple>
                <SVG src={IMG_ICON_OWL} />
                <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly height={60} />
                <SVG src={IMG_ICON_GHOST} />
              </SectionTitleIcon>
              <SectionTitleText>Trusted by the best</SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={3}>
              {CONTENT.trustedDAOs.map((dao, index) => {
                const isPng = dao.icon.endsWith('.png')
                return dao.description ? (
                  <TopicCard
                    key={index}
                    contentAlign={'center'}
                    bgColor={Color.neutral20}
                    padding={'24px'}
                    gap={12}
                    asProp="div"
                  >
                    <TopicImage iconColor={Color.neutral98} bgColor={'transparent'} height={100}>
                      {isPng ? <img src={dao.icon} alt={dao.title} /> : <SVG src={dao.icon} />}
                    </TopicImage>
                    <TopicCardInner contentAlign="center">
                      <TopicTitle fontSize={28} color={Color.neutral98}>
                        {dao.title}
                      </TopicTitle>
                      <TopicDescription fontSize={18} color={Color.neutral70}>
                        {dao.description}
                      </TopicDescription>
                      <Link
                        linkType={LinkType.TopicButton}
                        href={dao.link}
                        utmContent={`dao-${dao.title.toLowerCase().replace(/\s/g, '-')}`}
                        external
                        onClick={() => clickOnDaos(`click-${dao.title.toLowerCase()}`)}
                      >
                        Learn more
                      </Link>
                    </TopicCardInner>
                  </TopicCard>
                ) : (
                  <TopicCard
                    key={index}
                    contentAlign={'center'}
                    bgColor={Color.neutral20}
                    padding={'10px'}
                    href={`${dao.link}?utm_source=cow.fi&utm_medium=web&utm_content=dao-${dao.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => clickOnDaos(`click-${dao.title.toLowerCase()}`)}
                  >
                    <TopicImage
                      iconColor={Color.neutral0}
                      bgColor={'transparent'}
                      width={'100%'}
                      height={100}
                      maxWidth={75}
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
