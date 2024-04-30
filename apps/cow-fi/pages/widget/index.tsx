import { Button, ButtonVariant, ButtonWrapper } from '@/components/Button'
import { CustomLink } from '@/components/CustomLink'
import {
  CardItem,
  CardWrapper,
  Section,
  SectionContent,
  SectionH1,
  SectionImage,
  SubTitle,
} from '@/components/Home/index.styles'
import Layout from '@/components/Layout'
import { CONFIG } from '@/const/meta'
import { IMAGE_PATH } from '@/const/paths'
import { CowSwapWidget, CowSwapWidgetParams } from '@cowprotocol/widget-react'
import { WidgetEvents } from 'lib/analytics/GAEvents'
import { sendGAEventHandler } from 'lib/analytics/sendGAEvent'
import { LinkWithUtm } from 'modules/utm'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import styled from 'styled-components'
import { Color, Font, Media } from 'styles/variables'

const ArrowDrawn = '/images/arrow-drawn.svg'

const StickySectionTitle = styled.div`
position: sticky;
top: 12rem;
margin: 0 auto auto;

${Media.mobile} {
  position: relative;
  top: initial;
}
`

const WidgetContainer = styled.div`
display: flex;
width: 100%;
flex-flow: column wrap;
justify-content: flex-start;
align-items: center;
gap: 1.6rem;

&::before {
  color: ${Color.darkBlue};
  font-size: 2.1rem;
  font-weight: ${Font.weightBold};
  content: 'Try it out!';
  background: url(${ArrowDrawn}) no-repeat center 2.5rem / 2.4rem 5rem;
  width: 12rem;
  height: 7.5rem;
  margin: 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  transform: rotateZ(-15deg);
}

${Media.mobile} {
  > iframe {
    width: 100%;
  }
}
`

const DAO_LOGOS_PATH = '/images/dao-logos/'

const CONTENT = {
  configuratorURL: 'https://widget.cow.fi/',
  calendlyURL: 'https://cowprotocol.typeform.com/to/rONXaxHV',
  docsURL: 'https://docs.cow.fi/cow-protocol/tutorials/widget',
  everyBell: [
    {
      icon: `${IMAGE_PATH}/protection.svg`,
      title: 'Full Protection from MEV',
      description:
        "CoW Swap offers the best MEV protection in the land. Thanks to a delegated trading model that relies on experts to execute swaps, traders can rest assured that they're safe from the MEV bots.",
    },
    {
      icon: `${IMAGE_PATH}/surplus.svg`,
      title: 'Surplus-Capturing Orders',
      description:
        'Every order is surplus-capturing and traders usually earn a little extra in their sell token with each swap.',
    },
    {
      icon: `${IMAGE_PATH}/gasless.svg`,
      title: 'Gasless Trading',
      description:
        'All gas fees are paid in the sell token for swaps and even for token approvals. Users can enjoy ETH-free trading every time, even with brand-new wallets.',
    },
  ],
  trustedDAOs: [
    { icon: `${DAO_LOGOS_PATH}aave.svg`, title: 'Aave', link: 'https://aave.com/' },
    { icon: `${DAO_LOGOS_PATH}nexus.svg`, title: 'Nexus Mutual', link: 'https://nexusmutual.io/' },
    { icon: `${DAO_LOGOS_PATH}ens.svg`, title: 'ENS', link: 'https://ens.domains/' },
    { icon: `${DAO_LOGOS_PATH}karpatkey.svg`, title: 'Karpatkey', link: 'https://www.karpatkey.com/' },
    { icon: `${DAO_LOGOS_PATH}maker.svg`, title: 'MakerDAO', link: 'https://makerdao.com/' },
    { icon: `${DAO_LOGOS_PATH}lido.svg`, title: 'Lido', link: 'https://lido.fi/' },
    { icon: `${DAO_LOGOS_PATH}yearn.svg`, title: 'Yearn', link: 'https://yearn.finance/' },
    { icon: `${DAO_LOGOS_PATH}gnosis.svg`, title: 'Gnosis', link: 'https://www.gnosis.io/' },
    { icon: `${DAO_LOGOS_PATH}synthetix.svg`, title: 'Synthetix', link: 'https://synthetix.io/' },
    { icon: `${DAO_LOGOS_PATH}balancer.svg`, title: 'Balancer', link: 'https://balancer.fi/' },
    { icon: `${DAO_LOGOS_PATH}aura.svg`, title: 'Aura', link: 'https://aura.finance/' },
    { icon: `${DAO_LOGOS_PATH}vitadao.svg`, title: 'VitaDAO', link: 'https://www.vitadao.com/' },
    { icon: `${DAO_LOGOS_PATH}polygon.svg`, title: 'Polygon', link: 'https://polygon.technology/' },
    { icon: `${DAO_LOGOS_PATH}pleasrdao.svg`, title: 'PleasrDAO', link: 'https://pleasr.org/' },
    { icon: `${DAO_LOGOS_PATH}olympus.svg`, title: 'Olympus', link: 'https://www.olympusdao.finance/' },
    { icon: `${DAO_LOGOS_PATH}dxdao.svg`, title: 'DxDAO', link: 'https://dxdao.eth.limo/' },
    { icon: `${DAO_LOGOS_PATH}mstables.svg`, title: 'mStables', link: 'https://mstable.org/' },
    { icon: `${DAO_LOGOS_PATH}index.svg`, title: 'Index', link: 'https://indexcoop.com/' },
    { icon: `${DAO_LOGOS_PATH}rhino.svg`, title: 'Rhino', link: 'https://rhino.fi/' },
    { icon: `${DAO_LOGOS_PATH}jpgd.svg`, title: 'JPGD', link: 'https://jpegd.io/' },
    { icon: `${DAO_LOGOS_PATH}benddao.svg`, title: 'BendDAO', link: 'https://www.benddao.xyz/' },
    { icon: `${DAO_LOGOS_PATH}alchemix.svg`, title: 'Alchemix', link: 'https://alchemix.fi/' },
    { icon: `${DAO_LOGOS_PATH}stargate.svg`, title: 'Stargate', link: 'https://stargate.io/' },
    { icon: `${DAO_LOGOS_PATH}shapeshift.svg`, title: 'ShapeShift', link: 'https://shapeshift.com/' },
    { icon: `${DAO_LOGOS_PATH}stakedao.svg`, title: 'StakeDAO', link: 'https://stakedao.org/' },
    { icon: `${DAO_LOGOS_PATH}cryptex.svg`, title: 'Cryptex', link: 'https://cryptex.finance/' },
    { icon: `${DAO_LOGOS_PATH}frax.svg`, title: 'Frax', link: 'https://frax.finance/' },
    { icon: `${DAO_LOGOS_PATH}dfx.svg`, title: 'DFX', link: 'https://dfx.finance/' },
    { icon: `${DAO_LOGOS_PATH}reflexer.svg`, title: 'Reflexer', link: 'https://www.reflexer.finance/' },
    { icon: `${DAO_LOGOS_PATH}citydao.svg`, title: 'CityDAO', link: 'https://citydao.io/' },
    { icon: `${DAO_LOGOS_PATH}threshold.svg`, title: 'Threshold', link: 'https://threshold.network/' },
    { icon: `${DAO_LOGOS_PATH}krausehouse.svg`, title: 'KrauseHouse', link: 'https://krausehouse.ca/' },
    { icon: `${DAO_LOGOS_PATH}tokenlon.svg`, title: 'Tokenlon', link: 'https://tokenlon.im/' },
    { icon: `${DAO_LOGOS_PATH}idle.svg`, title: 'Idle', link: 'https://idle.finance/' },
    { icon: `${DAO_LOGOS_PATH}teller.svg`, title: 'Teller', link: 'https://teller.finance/' },
    { icon: `${DAO_LOGOS_PATH}sherlock.svg`, title: 'Sherlock', link: 'https://sherlock.xyz/' },
    { icon: `${DAO_LOGOS_PATH}badgerdao.svg`, title: 'BadgerDAO', link: 'https://badger.finance/' },
    { icon: `${DAO_LOGOS_PATH}solace.svg`, title: 'Solace', link: 'https://solace.fi/' },
    { icon: `${DAO_LOGOS_PATH}dreamdao.png`, title: 'DreamDAO', link: 'https://dreamdao.io/' },
    { icon: `${DAO_LOGOS_PATH}ondo.svg`, title: 'Ondo', link: 'https://ondo.finance/' },
    { icon: `${DAO_LOGOS_PATH}abracadabra.png`, title: 'Abracadabra', link: 'https://abracadabra.money/' },
    { icon: `${DAO_LOGOS_PATH}aragon.svg`, title: 'Aragorn', link: 'https://aragon.org/' },
  ],
  featureItems: [
    {
      description: 'Live styling configurator',
    },
    {
      description: 'Easy install with a snippet of code',
    },
    {
      description: 'External wallet management - use your own wallet connection',
    },
    {
      description: 'Internal wallet management - no wallet connection needed',
    },
    {
      description: 'Configurable token lists',
    },
    {
      description: 'Custom-tailored fees',
    },
    {
      description: 'Fully responsive, from 320px and up',
    },
    {
      description: 'Feature-adaptive display',
      comingSoon: true,
    },
  ],
}

const DATA_CACHE_TIME_SECONDS = 5 * 60 // Cache 5min

const widgetParams: CowSwapWidgetParams = {
  appCode: 'CoW Protocol: Widget Demo',
  theme: 'light',
  standaloneMode: true
}

export default function WidgetPage({ siteConfigData }) {
  const { social } = siteConfigData

  // Filter out Discord/Forum social links
  let socialFiltered = {}
  Object.entries(social).forEach(([key, value]) => {
    if (key !== 'forum' && key !== 'github') {
      socialFiltered[key] = value
    }
  })

  const pageTitle = `Widget - ${siteConfigData.title}`
  const pageDescription =
    'Integrate the CoW Swap widget to bring seamless, MEV-protected trading to your website or dApp.'

  return (
    <Layout fullWidthGradientVariant>
      <Head>
        <title>{pageTitle}</title>
        <meta key="description" name="description" content={pageDescription} />
        <meta key="ogTitle" property="og:title" content={pageTitle} />
        <meta key="ogDescription" property="og:description" content={pageDescription} />
        <meta key="twitterTitle" name="twitter:title" content={pageTitle} />
        <meta key="twitterDescription" name="twitter:description" content={pageDescription} />
      </Head>

      <Section firstSection>
        <SectionContent sticky>
          <div>
            <SectionH1 fontSize={6.8} fontSizeMobile={4} lineHeight={1} textAlign={'left'}>
              Bring reliable, MEV-protected swaps to your users
            </SectionH1>
            <SubTitle color={Color.text1} fontSize={2} lineHeight={1.6} maxWidth={60} textAlign="left">
              Integrate the CoW Swap widget to bring seamless, MEV-protected trading to your website or dApp. Delight
              your users while adding an extra revenue stream for your project - it&apos;s a win-win.
            </SubTitle>

            <ButtonWrapper>
              <LinkWithUtm
                href={CONTENT.configuratorURL}
                defaultUtm={{ ...CONFIG.utm, utmContent: 'widget-page-configure-widget-cta-hero' }}
                passHref
              >
                <Button
                  onClick={() => sendGAEventHandler(WidgetEvents.CONFIGURE_WIDGET)}
                  paddingLR={4.2}
                  fontSizeMobile={2.1}
                  label="Configure widget"
                  target="_blank"
                  rel="noopener nofollow"
                />
              </LinkWithUtm>

              <LinkWithUtm
                href={CONTENT.docsURL}
                defaultUtm={{ ...CONFIG.utm, utmContent: 'widget-page-readdocs-cta-hero' }}
                passHref
              >
                <Button
                  onClick={() => sendGAEventHandler(WidgetEvents.READ_DOCS)}
                  target="_blank"
                  rel="noopener nofollow"
                  paddingLR={4.2}
                  fontSizeMobile={2.1}
                  label="Read docs"
                  variant={ButtonVariant.TEXT}
                />
              </LinkWithUtm>
            </ButtonWrapper>
          </div>
        </SectionContent>

        <SectionContent flow="column">
          <div>
            <WidgetContainer id="COW-WIDGET">
              <CowSwapWidget params={widgetParams} />
            </WidgetContainer>
          </div>
        </SectionContent>
      </Section>

      <Section fullWidth colorVariant={'dark-gradient'} flow="column" gap={14}>
        <SectionContent flow={'row'} maxWidth={100} textAlign={'left'}>
          <div className="container">
            <h3>Earn Revenue for Your Project</h3>
            <SubTitle lineHeight={1.4} textAlign={'left'}>
              You may collect revenue when users trade with your widget.*
            </SubTitle>
          </div>
          <SectionImage>
            <img src={`${IMAGE_PATH}/eth-circles.svg`} alt="Make Money with CoW Swap" width="340" height="214" />
          </SectionImage>
        </SectionContent>

        <SectionContent flow={'row'} maxWidth={100} textAlign={'left'} reverseOrderMobile={'column-reverse'}>
          <SectionImage>
            <img src={`${IMAGE_PATH}/eth-blocks.svg`} alt="Integrate With Ease" width="340" height="214" />
          </SectionImage>
          <div className="container">
            <h3>Integrate With Ease</h3>
            <SubTitle lineHeight={1.4} textAlign={'left'} textAlignMobile={'center'}>
              The CoW Swap widget is quick to install and easy to customize. Add the widget to your site in under 5
              minutes by copy-pasting a few lines of code. Contact our team for implementation details.
            </SubTitle>
          </div>
        </SectionContent>
      </Section>

      <Section fullWidth>
        <SectionContent flow={'column'}>
          <div className="container">
            <h3>Every Bell, Whistle, and Moo</h3>
            <SubTitle lineHeight={1.4} maxWidth={85} color={Color.text1}>
              With the CoW Swap widget, you can offer your users everything you know and love about CoW Swap, and more.
              Oh, and yes… it does come with the “moo”.
            </SubTitle>

            <CardWrapper maxWidth={100} gap={3.8}>
              {CONTENT.everyBell.map(({ icon, title, description }, index) => (
                <CardItem key={index} imageHeight={5} imageRounded>
                  <img src={icon} alt="image" />
                  <h4>{title}</h4>
                  <p>{description}</p>
                </CardItem>
              ))}
            </CardWrapper>
          </div>
        </SectionContent>
      </Section>

      <Section fullWidth colorVariant={'grey'}>
        <SectionContent flow="row" variant={'grid-2'}>
          <StickySectionTitle>
            <h3>Everything You&apos;d Want in a Widget</h3>
          </StickySectionTitle>
          <div>
            <CardWrapper gap={2.4} horizontalGrid={1}>
              {CONTENT.featureItems
                .sort((a, b) => (a.comingSoon ? 1 : 0) - (b.comingSoon ? 1 : 0)) // Show coming soon items last
                .map(({ description, comingSoon }, index) => (
                  <CardItem
                    key={index}
                    imageHeight={4}
                    imageWidth={4}
                    imageRounded
                    variant="iconWithText"
                    style={{ background: comingSoon && Color.grey }}
                  >
                    <img
                      style={{ opacity: comingSoon ? 0.5 : 1 }}
                      alt={description || 'icon'}
                      src={comingSoon ? `${IMAGE_PATH}/icons/coming-soon.svg` : `${IMAGE_PATH}/icons/check-color.svg`}
                    />
                    <p>{description}</p>
                  </CardItem>
                ))}
            </CardWrapper>
          </div>
        </SectionContent>
      </Section>

      <Section fullWidth colorVariant={'dark'}>
        <SectionContent flow={'column'}>
          <div>
            <h3>Trusted by the Best in the Field</h3>
            <SubTitle lineHeight={1.4} maxWidth={80}>
              As a trusted name in the DeFi ecosystem, CoW Swap has handled almost $30 billion in trading volume. Whales
              and DAOs like Aave, ENS, and Gnosis execute their largest treasury swaps on the greener pastures of CoW
              Swap.
            </SubTitle>

            <CardWrapper maxWidth={85} horizontalGrid={8} horizontalGridMobile={4}>
              {CONTENT.trustedDAOs.map(({ icon, title, link }, index) => (
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
                  <LinkWithUtm
                    href={link}
                    defaultUtm={{ ...CONFIG.utm, utmContent: `widget-page-partner-${title}` }}
                    passHref
                  >
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

      <Section>
        <SectionContent flow="column">
          <div className="container">
            <h3>Integrate in 5 Minutes or less</h3>

            <ButtonWrapper center>
              <LinkWithUtm
                href={CONTENT.calendlyURL}
                defaultUtm={{ ...CONFIG.utm, utmContent: 'widget-page-footerCTA-talk-to-us' }}
                passHref
              >
                <Button
                  onClick={() => sendGAEventHandler(WidgetEvents.TALK_TO_US)}
                  paddingLR={4.2}
                  label="Talk to us"
                  fontSizeMobile={2.1}
                  target="_blank"
                  rel="noopener nofollow"
                />
              </LinkWithUtm>

              <LinkWithUtm
                href={CONTENT.docsURL}
                defaultUtm={{ ...CONFIG.utm, utmContent: 'widget-page-footerCTA-read-docs' }}
                passHref
              >
                <Button
                  onClick={() => sendGAEventHandler(WidgetEvents.READ_DOCS)}
                  target="_blank"
                  rel="noopener nofollow"
                  paddingLR={4.2}
                  fontSizeMobile={2.1}
                  label="Read docs"
                  variant={ButtonVariant.TEXT}
                />
              </LinkWithUtm>

              <Link
                href={CONFIG.url.widgetTnC}
                passHref
              >
                <Button
                  onClick={() => sendGAEventHandler(WidgetEvents.READ_TERMS)}
                  paddingLR={1}
                  fontSizeMobile={2.1}
                  label="Terms & Conditions"
                  variant={ButtonVariant.TEXT}
                />
              </Link>
            </ButtonWrapper>
          </div>
        </SectionContent>
      </Section>

      {/* Disclaimer */}
      <Section padding="0" paddingMobile="0 1.6rem">
        <SectionContent flow="column">
          <div className="container">
            <SubTitle lineHeight={1.4} maxWidth={80} fontSize={1.3} fontSizeMobile={1.3} color={Color.text1}>
              <strong>* Important Disclaimer:</strong> Use of this widget is subject to the laws and regulations of your
              jurisdiction. You are solely responsible for ensuring compliance, and the provider is not liable for any
              legal consequences or issues arising from your failure to adhere. Using the widget indicates acceptance of
              the <CustomLink url="/widget/terms-and-conditions" label="Terms and Conditions" />; if you do not agree, refrain from using it.
            </SubTitle>
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
