import { GetStaticProps } from 'next'
import { Font, Color } from '@cowprotocol/ui'
import IMG_ICON_GOVERNANCE from '@cowprotocol/assets/images/icon-governance.svg'
import VIDEO_HERO_HOME from '@cowprotocol/assets/video/cow-dao-hero-animation.mp4'

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
  SectionTitleWrapper,
  SectionTitleIcon,
  SectionTitleText,
  SectionTitleDescription,
  HeroContainer,
  HeroBackground,
  HeroContent,
  HeroTitle,
  TopicCardInner,
  TopicDescription,
} from '@/styles/styled'

import SVG from 'react-inlinesvg'
import IMG_ICON_BULB_COW from '@cowprotocol/assets/images/icon-bulb-cow.svg'
import IMG_ICON_GRANTS_CARTON from '@cowprotocol/assets/images/icon-grants-carton.svg'

import { CONFIG, DATA_CACHE_TIME_SECONDS } from '@/const/meta'

import { CHANNEL_LIST, PRODUCT_LIST } from '@/data/home/const'
import { clickOnHome } from 'modules/analytics'

interface PageProps {
  siteConfigData: typeof CONFIG
}

export default function Page() {
  return (
    <Layout bgColor={Color.neutral90}>
      <PageWrapper>
        <HeroContainer minHeight="700px" maxWidth={'100%'} margin="-76px auto -48px" padding="142px 20px 56px">
          <HeroBackground>
            <video autoPlay loop muted playsInline>
              <source src={VIDEO_HERO_HOME} type="video/mp4" />
            </video>
          </HeroBackground>
          <HeroContent flex={'0 1 0'}>
            <HeroTitle fontSize={148} fontSizeMobile={80}>
              Don’t get milked!
            </HeroTitle>
          </HeroContent>
        </HeroContainer>

        <ContainerCard bgColor={Color.neutral100}>
          <ContainerCardSection>
            <SectionTitleWrapper color={Color.neutral0} maxWidth={1200} margin="100px auto">
              <SectionTitleText lineHeight={1.6} lineHeightMobile={1.8} fontSizeMobile={28}>
                CoW DAO develops the <span className="wordtag-orange">most user-protective</span> products in DeFi – so
                you can <span className="wordtag-purple">do more</span> with{' '}
                <span className="wordtag-blue">less worry</span>
              </SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={2}>
              {PRODUCT_LIST.map((topic, index) => (
                <TopicCard
                  key={index}
                  contentAlign={'left'}
                  bgColor={topic.bgColor}
                  textColor={topic.textColor}
                  padding={'32px'}
                  asProp="div"
                >
                  <TopicCardInner contentAlign="left">
                    <TopicTitle fontSize={51}>{topic.title}</TopicTitle>
                    <TopicDescription fontSize={28} color={topic.descriptionColor}>
                      {topic.description}
                    </TopicDescription>
                    <Link
                      bgColor={topic.linkBgColor}
                      color={topic.linkColor}
                      href={topic.linkHref}
                      linkType={LinkType.TopicButton}
                      onClick={() => clickOnHome(topic.linkEvent)}
                      external={topic.linkExternal}
                      utmContent={topic.linkUtmContent}
                    >
                      {topic.linkText}
                    </Link>
                  </TopicCardInner>
                  <TopicImage
                    iconColor="transparent"
                    bgColor="transparent"
                    margin={'0 0 0 auto'}
                    height={'236px'}
                    width={'auto'}
                  >
                    <SVG src={topic.iconImage} title={topic.title} />
                  </TopicImage>
                </TopicCard>
              ))}
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'}>
          <ContainerCardSection>
            <SectionTitleWrapper maxWidth={900}>
              <SectionTitleIcon size={126}>
                <SVG src={IMG_ICON_BULB_COW} />
              </SectionTitleIcon>
              <SectionTitleText>Innovation in action</SectionTitleText>
              <SectionTitleDescription color={Color.neutral30}>
                CoW DAO is famous for pioneering technology at the forefront of intents, MEV protection, and more.{' '}
                <br />
                Whether you're a crypto beginner or an Ethereum OG, you can learn more about these important topics in
                the CoW DAO Knowledge Base.
              </SectionTitleDescription>

              <Link
                linkType={LinkType.SectionTitleButton}
                href="/learn"
                onClick={() => clickOnHome('click-cow-knowledge-base-learn-more')}
              >
                Learn more
              </Link>
            </SectionTitleWrapper>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={Color.neutral10} color={Color.neutral98}>
          <ContainerCardSection>
            <SectionTitleWrapper padding="150px 0 0" maxWidth={900}>
              <SectionTitleIcon size={90}>
                <SVG src={IMG_ICON_GOVERNANCE} />
              </SectionTitleIcon>
              <SectionTitleText textAlign="center">Governance</SectionTitleText>
              <SectionTitleDescription color={Color.neutral60} fontWeight={Font.weight.regular} textAlign="center">
                Anyone can join CoW DAO by holding{' '}
                <Link
                  href="https://swap.cow.fi/#/1/swap/USDC/COW"
                  onClick={() => clickOnHome('click-cow-tokens')}
                  external
                >
                  COW tokens
                </Link>
                . Tokenholders contribute to CoW DAO's mission by participating in "CoWmunity" discussions on Discord,
                by adding proposals to the CoW DAO Forum, and by voting on governance actions in Snapshot.
              </SectionTitleDescription>
            </SectionTitleWrapper>

            <TopicList columns={3} columnsTablet={2}>
              {CHANNEL_LIST.map((social, index) => (
                <TopicCard
                  key={index}
                  textColor={social.textColor}
                  bgColor={social.iconColor}
                  href={social.href}
                  rel="noopener noreferrer"
                  target="_blank"
                  onClick={() => clickOnHome(social.linkEvent)}
                >
                  <TopicImage iconColor="transparent" maxWidth={290} maxHeight={290} height={290} width={290}>
                    <SVG src={social.iconImage} title={social.title} />
                  </TopicImage>
                  <TopicTitle fontSize={38}>{social.title}</TopicTitle>
                </TopicCard>
              ))}
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={Color.neutral90} color={Color.neutral10} touchFooter>
          <ContainerCardSection>
            <SectionTitleWrapper maxWidth={900}>
              <SectionTitleIcon size={90}>
                <SVG src={IMG_ICON_GRANTS_CARTON} />
              </SectionTitleIcon>
              <SectionTitleText textAlign="center">Grants</SectionTitleText>
              <SectionTitleDescription color={Color.neutral30} fontWeight={Font.weight.regular} textAlign="center">
                The CoW DAO Grants Program funds mission-aligned projects and people working on MEV protection, trading
                innovation, and ecosystem development.
              </SectionTitleDescription>
              <Link
                external
                linkType={LinkType.SectionTitleButton}
                utmContent="home-page-apply-for-a-grant"
                href="https://grants.cow.fi/"
                onClick={() => clickOnHome('click-apply-for-a-grant')}
              >
                Explore grants
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

  return {
    props: {
      siteConfigData,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
