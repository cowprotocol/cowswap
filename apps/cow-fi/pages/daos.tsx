import Head from 'next/head'
import { GetStaticProps } from 'next'
import styled from 'styled-components'
import { transparentize } from 'polished'
import { CONFIG } from '@/const/meta'
import { DAO_CONTENT as CONTENT } from '@/data/siteContent/daos'
import { Media, Color, Font } from 'styles/variables'
import {
  Section,
  SectionH1,
  SectionContent,
  SubTitle,
  CardWrapper,
  CardItem,
  TrustedBy,
} from '@/components/Home/index.styles'
import Layout from '@/components/Layout'
import SocialList from '@/components/SocialList'
import { LinkWithUtm } from 'modules/utm'
import { Button } from '@/components/Button'
import SVG from 'react-inlinesvg'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'

const SwiperSlideWrapper = styled.div`
  --swiper-navigation-color: ${Color.lightBlue};
  --swiper-theme-color: ${Color.lightBlue};
  --swiper-pagination-bullet-inactive-color: ${Color.lightBlue};
  --swiper-pagination-bullet-size: 1.2rem;

  display: flex;
  flex-flow: column wrap;
  width: 100%;
  overflow: hidden;

  .daoSwiper {
    position: relative;
    padding: 0 0 5rem; // Fix for swiper pagination

    ${Media.mobile} {
      overflow-x: visible;
    }

    &::before,
    &::after {
      content: '';
      height: 100%;
      width: 16rem;
      position: absolute;
      left: 0;
      top: 0;
      background: linear-gradient(90deg, ${Color.darkBlue}, ${transparentize(1, Color.darkBlue)} 100%);
      z-index: 10;

      ${Media.mobile} {
        display: none;
        content: none;
      }
    }

    &::after {
      background: linear-gradient(270deg, ${Color.darkBlue}, ${transparentize(1, Color.darkBlue)} 100%);
      left: initial;
      right: 0;
    }
  }

  .daoSwiper {
    display: flex;
    flex-flow: column wrap;
    width: 100%;
    max-width: 100%;
  }

  .daoSwiper > .swiper-wrapper {
    max-width: 80%;
    align-items: flex-start;
    justify-content: flex-start;

    ${Media.mobile} {
      max-width: 100%;
      align-items: stretch;
    }
  }

  .daoSwiper > .swiper-wrapper > .swiper-slide {
    height: 49rem;
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    border-radius: 6rem;
    border: 0.1rem solid ${Color.border};
    color: ${Color.lightBlue};
    font-size: 2.4rem;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;
    justify-content: flex-start;
    overflow: hidden;

    ${Media.mediumDown} {
      height: auto;
      max-width: 95%;
      display: flex;
      flex-flow: column wrap;
    }

    > img {
      max-width: 100%;
      height: 100%;
      object-fit: cover;

      ${Media.mediumDown} {
        height: 12rem;
        width: 100%;
        margin: 0 auto 2.4rem;
      }
    }

    > span {
      display: flex;
      flex-flow: column wrap;
      padding: 5.6rem;
      gap: 2.4rem;

      ${Media.mediumDown} {
        padding: 0 3.2rem 4.6rem;
      }
    }

    > span > h4 {
      margin: 0;
      font-size: 3.4rem;
      line-height: 1.2;
      color: ${Color.lightBlue};
      font-weight: ${Font.weightMedium};
      background: ${Color.gradient};
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;

      &::selection {
        background-clip: initial;
        -webkit-text-fill-color: initial;
      }

      ${Media.mobile} {
        font-size: 2.4rem;
      }
    }

    > span > p {
      font-size: 1.8rem;
      line-height: 1.4;

      ${Media.mobile} {
        font-size: 1.6rem;
      }
    }
  }

  .swiper-button-next {
    z-index: 20;

    ${Media.mobile} {
      left: initial;
      right: 5px;
    }
  }

  .swiper-button-prev {
    z-index: 20;

    ${Media.mobile} {
      left: 5px;
      right: initial;
    }
  }
`

const DATA_CACHE_TIME_SECONDS = 5 * 60 // Cache 5min

export default function ForDAOs({ siteConfigData }) {
  const { social } = siteConfigData

  // Filter out Discord/Forum social links
  let socialFiltered = {}
  Object.entries(social).forEach(([key, value]) => {
    if (key !== 'forum' && key !== 'github') {
      socialFiltered[key] = value
    }
  })

  const handleCTAClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault()
    const href = e.currentTarget.href
    const targetId = href.replace(/.*\#/, '')
    const elem = document.getElementById(targetId)
    elem?.scrollIntoView({ behavior: 'smooth' })
  }

  const pageTitle = `CoW Swap for DAOs`
  const pageDescription =
    'CoW Swap protects DAOs from MEV and ensures they get the best prices for their treasury trades.'

  return (
    <Layout fullWidthGradientVariant={true}>
      <Head>
        <title>{pageTitle}</title>
        <meta key="description" name="description" content={pageDescription} />
        <meta key="ogTitle" property="og:title" content={pageTitle} />
        <meta key="ogDescription" property="og:description" content={pageDescription} />
        <meta key="twitterTitle" name="twitter:title" content={pageTitle} />
        <meta key="twitterDescription" name="twitter:description" content={pageDescription} />
      </Head>

      <Section fullWidth padding={'8rem 8rem 4rem'} paddingMobile={'0 2.4rem 4rem'}>
        <SectionContent flow="column">
          <div>
            <SectionH1 fontSize={7} fontSizeMobile={4}>
              <b>
                <i>Savvy DAOs</i>
              </b>{' '}
              <span className="text-weight-light">
                <br />
                Choose CoW Swap
              </span>
            </SectionH1>
            <SubTitle color={Color.text1} fontSize={3} lineHeight={1.4} maxWidth={60}>
              The smartest DAOs trust CoW Swap with their most-important trades
            </SubTitle>
            <Button href="#benefits" onClick={handleCTAClick} paddingLR={4.2} fontSizeMobile={2.1} label="Learn why" />
          </div>
        </SectionContent>
      </Section>

      <Section fullWidth padding={'0'} paddingMobile={'0'}>
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
      </Section>

      <Section fullWidth colorVariant={'dark'} id="benefits">
        <SectionContent>
          <SwiperSlideWrapper>
            <h3>Expert trading for expert DAOs</h3>
            <SubTitle color={Color.lightBlue} lineHeight={1.4} maxWidth={80}>
              CoW Swap is the only DEX built to solve the unique challenges faced by DAOs
            </SubTitle>
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
        </SectionContent>
      </Section>

      <Section fullWidth>
        <SectionContent flow={'column'}>
          <div className="container">
            <h3>Advanced order types</h3>
            <SubTitle color={Color.text1} lineHeight={1.4} maxWidth={70}>
              CoW Swap&apos;s many order types help you get better prices for your trades, manage token launches,
              facilitate buybacks, and much more
            </SubTitle>

            <CardWrapper maxWidth={100}>
              {CONTENT.orderTypes.map((orderType, index) => (
                <CardItem key={index} imageHeight={8} imageRounded>
                  <img src={orderType.icon} alt="image" />
                  <h4>{orderType.title}</h4>
                  <p>{orderType.description}</p>
                </CardItem>
              ))}
            </CardWrapper>

            <LinkWithUtm
              href={'https://blog.cow.fi/list/advanced-order-types-b391bd4390cb'}
              defaultUtm={{ ...CONFIG.utm, utmContent: 'daos-page' }}
              passHref
            >
              <Button paddingLR={4.2} label="Explore Advanced Order Types" target="_blank" rel="noopener nofollow" />
            </LinkWithUtm>
          </div>
        </SectionContent>
      </Section>

      <Section fullWidth colorVariant={'dark'}>
        <SectionContent>
          <div>
            <h3>Trusted by the best</h3>

            {/* Only DAOs with a description text */}
            <CardWrapper maxWidth={85}>
              {CONTENT.trustedDAOs
                .filter(({ description }) => description)
                .map(({ description, icon, title, link }, index) => (
                  <CardItem key={index} variant="outlined-dark" gap={3.6} imageFullSize textCentered>
                    <LinkWithUtm href={link} defaultUtm={{ ...CONFIG.utm, utmContent: 'daos-page' }} passHref>
                      <a target="_blank" rel="nofollow noreferrer">
                        <img src={icon} alt={title} />
                      </a>
                    </LinkWithUtm>
                    <span>
                      <p>{description}</p>
                      <LinkWithUtm href={link} defaultUtm={{ ...CONFIG.utm, utmContent: 'daos-page' }} passHref>
                        <a href={link} target="_blank" rel="nofollow noreferrer">
                          Case study
                        </a>
                      </LinkWithUtm>
                    </span>
                  </CardItem>
                ))}
            </CardWrapper>

            {/* DAOs without a description text (only logo) */}
            <CardWrapper maxWidth={85} horizontalGrid={8} horizontalGridMobile={4}>
              {CONTENT.trustedDAOs
                .filter(({ description }) => !description)
                .map(({ icon, title, link }, index) => (
                  <CardItem
                    key={index}
                    padding={1.2}
                    imageFullSize
                    variant="outlined-dark"
                    gap={3.6}
                    textCentered
                    contentCentered
                    className="iconOnly"
                  >
                    <LinkWithUtm href={link} defaultUtm={{ ...CONFIG.utm, utmContent: 'daos-page' }} passHref>
                      <a href={link} target="_blank" rel="nofollow noreferrer" title={title}>
                        <img src={icon} alt={title} />
                      </a>
                    </LinkWithUtm>
                  </CardItem>
                ))}
            </CardWrapper>
          </div>
        </SectionContent>
      </Section>

      <Section fullWidth>
        <SectionContent flow={'column'}>
          <div>
            <h3>Get in touch</h3>
            <SubTitle maxWidth={60} color={Color.text1} lineHeight={1.4}>
              Learn more about how CoW Protocol can help your DAO by reaching out on Twitter or Discord
            </SubTitle>
            <SocialList social={socialFiltered} color={Color.darkBlue} />
          </div>
        </SectionContent>
      </Section>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const siteConfigData = CONFIG

  return {
    props: {
      siteConfigData,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
