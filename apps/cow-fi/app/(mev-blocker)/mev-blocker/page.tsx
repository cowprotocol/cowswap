'use client'

import '@rainbow-me/rainbowkit/styles.css'

import IMAGE_ICON_MEVBLOCKER_CHATBALLOON from '@cowprotocol/assets/images/icon-mevblocker-chatballoon.svg'
import IMAGE_ICON_MEVBLOCKER_PROTECT from '@cowprotocol/assets/images/icon-mevblocker-protect.svg'
import IMAGE_ICON_MEVBLOCKER_PROTECT2 from '@cowprotocol/assets/images/icon-mevblocker-protect2.svg'
import IMAGE_ICON_MEVBLOCKER_TRUST from '@cowprotocol/assets/images/icon-mevblocker-trust.svg'
import IMAGE_ICON_QUESTIONBALLOON from '@cowprotocol/assets/images/icon-question-balloon.svg'
import IMAGE_SANDWICH_GUY from '@cowprotocol/assets/images/image-sandwich-guy.svg'
import { Color, ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import { RainbowKitProvider, getDefaultWallets, Chain } from '@rainbow-me/rainbowkit'
import Script from 'next/script'
import { CowFiCategory, toCowFiGtmEvent } from 'src/common/analytics/types'
import { WagmiConfig, createConfig, configureChains, mainnet, Connector } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'

import useWebShare from '../../../hooks/useWebShare'

import { AddRpcButton } from '@/components/AddRpcButton'
import FAQ from '@/components/FAQ'
import LazySVG from '@/components/LazySVG'
import { Link, LinkType } from '@/components/Link'
import { FAQ_DATA, TRUSTED_BY_CONTENT, TESTIMONIAL_LIST, MEV_BLOCKER_LIST } from '@/data/mev-blocker/const'
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
  ColorTable,
  ColorTableCell,
  ColorTableHeader,
  ColorTableContainer,
  TopicTable,
} from '@/styles/styled'

const isClient = typeof window === 'object'

// Configure chains and providers
const { chains, publicClient } = configureChains([mainnet], [publicProvider()])

// Get default wallets
const { connectors } = getDefaultWallets({
  appName: 'Your App Name',
  projectId: 'YOUR_PROJECT_ID', // TODO: Add project ID here
  chains: chains as Chain[],
})

// Create the Wagmi client
const wagmiClient = createConfig({
  autoConnect: isClient,
  connectors: connectors as unknown as () => Connector[],
  publicClient,
})

export default function Page() {
  const { share, message } = useWebShare()

  const handleShareClick = () => {
    share({
      title: 'MEV Blocker',
      text: 'Check out MEV Blocker! It helps protect you from MEV damage.',
      url: 'https://cow.fi/mev-blocker',
    })
  }

  return (
    <WagmiConfig config={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <PageWrapper>
          <HeroContainer variant="secondary">
            <HeroContent variant="secondary">
              <HeroSubtitle color={Color.cowfi_orange_bright}>MEV Blocker</HeroSubtitle>
              <HeroTitle>The best MEV protection under the sun</HeroTitle>
              <HeroDescription fontSize={21}>
                MEV Blocker is your personal protection from frontrunning and sandwich attacks for a broad spectrum of
                Ethereum transactions
                <br />
                <br />
                <b>How it works:</b>
                <ol>
                  <li>Add the RPC endpoint directly to your wallet</li>
                  <li>Enjoy full, automatic protection from all types of MEV</li>
                  <li>Get paid by searchers for your transactions </li>
                </ol>
              </HeroDescription>

              <Link
                linkType={LinkType.HeroButton}
                bgColor={Color.cowfi_orange_bright}
                color={Color.cowfi_orange_pale}
                href="#rpc"
                data-click-event={toCowFiGtmEvent({
                  category: CowFiCategory.MEVBLOCKER,
                  action: 'Click Get Protected',
                })}
              >
                Get protected
              </Link>
            </HeroContent>
            <HeroImage width={470} height={'auto'} color={Color.cowfi_orange_bright}>
              <LazySVG src={IMAGE_SANDWICH_GUY} />
            </HeroImage>
          </HeroContainer>

          <MetricsCard bgColor={Color.cowfi_orange_bright} color={Color.cowfi_orange_pale} columns={3} touchFooter>
            <MetricsItem dividerColor={Color.cowfi_orange_light}>
              <h2>$208B+</h2>
              <p>volume protected from MEV, across 46M+ transactions</p>
            </MetricsItem>
            <MetricsItem dividerColor={Color.cowfi_orange_light}>
              <h2>4.6K+</h2>
              <p>ETH rebated to users</p>
            </MetricsItem>
            <MetricsItem>
              <h2>$26</h2>
              <p>USD value of median rebate</p>
            </MetricsItem>

            <Link
              bgColor="transparent"
              color={Color.cowfi_orange_pale}
              margin="24px auto 0"
              gridFullWidth
              href="https://dune.com/cowprotocol/mev-blocker"
              external
              linkType={LinkType.SectionTitleButton}
              utmContent="mev-blocker-metrics-link"
              data-click-event={toCowFiGtmEvent({
                category: CowFiCategory.MEVBLOCKER,
                action: 'Click Metrics',
              })}
            >
              View all metrics on DUNE &#8599;
            </Link>
          </MetricsCard>

          <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_100})`}>
            <ContainerCardSection gap={60}>
              <SectionTitleWrapper color={`var(${UI.COLOR_NEUTRAL_10})`} maxWidth={1300} gap={56}>
                <SectionTitleIcon $multiple $size={82}>
                  <LazySVG src={IMAGE_ICON_MEVBLOCKER_PROTECT} />
                </SectionTitleIcon>
                <SectionTitleText maxWidth={500}>Broad spectrum MEV defense</SectionTitleText>
                <SectionTitleDescription maxWidth={'100%'} color={`var(${UI.COLOR_NEUTRAL_50})`}>
                  MEV bots have extracted more than{' '}
                  <Link
                    href="https://dune.com/queries/2259793/3703605"
                    external
                    utmContent="mev-blocker-dune-link"
                    data-click-event={toCowFiGtmEvent({
                      category: CowFiCategory.MEVBLOCKER,
                      action: 'Click Metrics',
                    })}
                  >
                    $1.43 billion
                  </Link>{' '}
                  from well-meaning Ethereum users across a variety of use cases (trading, providing liquidity, minting
                  NFTs, etc). MEV Blocker is an RPC endpoint that supports these users by offering:
                </SectionTitleDescription>
              </SectionTitleWrapper>

              <TopicList columns={3} columnsTablet={2}>
                {MEV_BLOCKER_LIST.map((item) => (
                  <TopicCard key={item.id} contentAlign={'left'} bgColor={item.bgColor} padding={'32px'} asProp="div">
                    <TopicCardInner contentAlign="left">
                      <TopicDescription fontSize={28} fontSizeMobile={24} color={item.textColor}>
                        {item.description}
                      </TopicDescription>
                    </TopicCardInner>
                    <TopicImage bgColor="transparent" margin={'auto 0 0 auto'} height={200} width={'auto'}>
                      <LazySVG src={item.iconImage} title={item.description} />
                    </TopicImage>
                  </TopicCard>
                ))}
              </TopicList>

              <SectionTitleWrapper maxWidth={1200} margin="0 auto">
                <SectionTitleDescription fontSize={28} color={`var(${UI.COLOR_NEUTRAL_50})`}>
                  Curious if you&apos;ve been the victim of an MEV attack?{' '}
                  <Link
                    href="https://www.mevscanner.com/"
                    external
                    utmContent="mev-blocker-mev-scanner-link"
                    data-click-event={toCowFiGtmEvent({
                      category: CowFiCategory.MEVBLOCKER,
                      action: 'Click MEV Scanner',
                    })}
                  >
                    Use MEV Scanner
                  </Link>{' '}
                  to find out
                </SectionTitleDescription>
              </SectionTitleWrapper>
            </ContainerCardSection>
          </ContainerCard>

          <ContainerCard bgColor="transparent" color={`var(${UI.COLOR_NEUTRAL_10})`} id="rpc">
            <ContainerCardSection>
              <SectionTitleWrapper maxWidth={850} gap={56} margin="24px auto">
                <SectionTitleIcon $multiple $size={82}>
                  <LazySVG src={IMAGE_ICON_MEVBLOCKER_PROTECT2} />
                </SectionTitleIcon>
                <SectionTitleText>Get Protected</SectionTitleText>
                <SectionTitleDescription color={`var(${UI.COLOR_NEUTRAL_50})`}>
                  Add this RPC endpoint to your wallet to enjoy the full benefits of MEV Blocker
                </SectionTitleDescription>
                <SectionTitleDescription fontSize={21} color={`var(${UI.COLOR_NEUTRAL_50})`}>
                  Note: some wallets make you reselect MEV Blocker every time you change networks
                </SectionTitleDescription>
              </SectionTitleWrapper>
              <TopicList columns={2} columnsTablet={1}>
                <TopicCard contentAlign={'left'} bgColor={`var(${UI.COLOR_NEUTRAL_100})`} padding={'32px'} asProp="div">
                  <TopicCardInner contentAlign="left">
                    <TopicTitle color={`var(${UI.COLOR_NEUTRAL_0})`} fontSize={28}>
                      Click to add to your client
                    </TopicTitle>
                    <TopicDescription fontSize={21}>MEV Blocker (Ethereum Mainnet)</TopicDescription>
                    <AddRpcButton />
                  </TopicCardInner>
                </TopicCard>

                <TopicCard contentAlign={'left'} bgColor={`var(${UI.COLOR_NEUTRAL_100})`} padding={'32px'} asProp="div">
                  <TopicCardInner contentAlign="left">
                    <TopicTitle color={`var(${UI.COLOR_NEUTRAL_0})`} fontSize={28}>
                      Add manually
                    </TopicTitle>

                    <TopicTable>
                      <tbody>
                        <tr>
                          <td>Network name</td>
                          <td>
                            <b>MEV Blocker</b>
                          </td>
                        </tr>
                        <tr>
                          <td>New RPC URL</td>
                          <td>
                            <b>https://rpc.mevblocker.io</b>
                          </td>
                        </tr>
                        <tr>
                          <td>Chain ID</td>
                          <td>
                            <b>1</b>
                          </td>
                        </tr>
                        <tr>
                          <td>Currency symbol</td>
                          <td>
                            <b>ETH</b>
                          </td>
                        </tr>
                        <tr>
                          <td>Block Explorer URL</td>
                          <td>
                            <b>https://etherscan.io</b>
                          </td>
                        </tr>
                      </tbody>
                    </TopicTable>
                  </TopicCardInner>
                </TopicCard>
              </TopicList>
              <SectionTitleWrapper margin={'24px auto 0'}>
                <SectionTitleDescription fontSize={28} color={`var(${UI.COLOR_NEUTRAL_50})`} maxWidth={700}>
                  Having trouble? Check your wallet&apos;s documentation for instructions on how to update your RPC
                  endpoint
                </SectionTitleDescription>
              </SectionTitleWrapper>
            </ContainerCardSection>
          </ContainerCard>

          <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_10})`} color={`var(${UI.COLOR_NEUTRAL_100})`}>
            <ContainerCardSection>
              <SectionTitleWrapper maxWidth={700}>
                <SectionTitleIcon>
                  <ProductLogo variant={ProductVariant.MevBlocker} theme="dark" logoIconOnly />
                </SectionTitleIcon>
                <SectionTitleText>Multiple endpoints for multiple protection types</SectionTitleText>
                <SectionTitleDescription color={`var(${UI.COLOR_NEUTRAL_50})`}>
                  Advanced MEV Blocker users can select from a variety of endpoints to suit their specific needs
                </SectionTitleDescription>
              </SectionTitleWrapper>

              <ColorTableContainer>
                <ColorTable>
                  <thead>
                    <tr>
                      <ColorTableHeader></ColorTableHeader>
                      <ColorTableHeader>Frontrunning</ColorTableHeader>
                      <ColorTableHeader>Backrunning</ColorTableHeader>
                      <ColorTableHeader>Tx Revert</ColorTableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <ColorTableCell>/fast (default)</ColorTableCell>
                      <ColorTableCell className="protected">Protected</ColorTableCell>
                      <ColorTableCell className="refund">Refund</ColorTableCell>
                      <ColorTableCell className="not-protected">Not protected</ColorTableCell>
                    </tr>
                    <tr>
                      <ColorTableCell>/noreverts</ColorTableCell>
                      <ColorTableCell className="protected">Protected</ColorTableCell>
                      <ColorTableCell className="refund">Refund</ColorTableCell>
                      <ColorTableCell className="protected">Protected</ColorTableCell>
                    </tr>
                    <tr>
                      <ColorTableCell>/fullprivacy</ColorTableCell>
                      <ColorTableCell className="max-protection">Max protection</ColorTableCell>
                      <ColorTableCell className="no-rebate">No rebate</ColorTableCell>
                      <ColorTableCell className="protected">Protected</ColorTableCell>
                    </tr>
                    <tr>
                      <ColorTableCell>/maxbackruns</ColorTableCell>
                      <ColorTableCell className="protected">Protected</ColorTableCell>
                      <ColorTableCell className="refund">Refund</ColorTableCell>
                      <ColorTableCell className="protected">Protected</ColorTableCell>
                    </tr>
                    <tr>
                      <ColorTableCell>/nochecks</ColorTableCell>
                      <ColorTableCell className="max-protection">Max protection</ColorTableCell>
                      <ColorTableCell className="no-rebate">No rebate</ColorTableCell>
                      <ColorTableCell className="not-protected">Not protected</ColorTableCell>
                    </tr>
                  </tbody>
                </ColorTable>
              </ColorTableContainer>

              <SectionTitleWrapper margin={'24px auto 0'}>
                <SectionTitleDescription color={`var(${UI.COLOR_NEUTRAL_50})`}>
                  To learn more about each of the endpoints MEV Blocker has to offer,{' '}
                  <Link
                    href="https://docs.cow.fi/mevblocker"
                    external
                    utmContent="mev-blocker-docs-link"
                    data-click-event={toCowFiGtmEvent({
                      category: CowFiCategory.MEVBLOCKER,
                      action: 'Click Docs',
                    })}
                  >
                    read the MEV Blocker docs
                  </Link>
                </SectionTitleDescription>
              </SectionTitleWrapper>
            </ContainerCardSection>
          </ContainerCard>

          <ContainerCard bgColor={'transparent'}>
            <ContainerCardSection>
              <SectionTitleWrapper>
                <SectionTitleIcon>
                  <LazySVG src={IMAGE_ICON_MEVBLOCKER_CHATBALLOON} />
                </SectionTitleIcon>
                <SectionTitleText>What others are saying...</SectionTitleText>
              </SectionTitleWrapper>

              <TopicList columns={3} columnsTablet={2}>
                {TESTIMONIAL_LIST.map((testimonial) => (
                  <TopicCard
                    key={testimonial.title}
                    contentAlign={'left'}
                    bgColor={testimonial.bgColor}
                    textColor={testimonial.textColor}
                    padding={'24px'}
                    asProp="div"
                    border="none"
                  >
                    <TopicCardInner
                      height="100%"
                      contentAlign="left"
                      contentAlignMobile="left"
                      gap={52}
                      minHeight="260px"
                    >
                      <TopicTitle fontSize={28}>{testimonial.title}</TopicTitle>
                      <TopicDescription margin="auto 0 0" fontSize={21}>
                        {testimonial.description}
                      </TopicDescription>
                    </TopicCardInner>
                    <TopicImage
                      iconColor="transparent"
                      bgColor="transparent"
                      margin={'auto auto 0 0'}
                      height={100}
                      width={'auto'}
                      widthMobile={'auto'}
                      position={'absolute'}
                      bottom={0}
                      right={0}
                    >
                      <LazySVG src={testimonial.iconImage} title={testimonial.title} />
                    </TopicImage>
                  </TopicCard>
                ))}
              </TopicList>
            </ContainerCardSection>
          </ContainerCard>

          <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_100})`}>
            <ContainerCardSection>
              <SectionTitleWrapper maxWidth={900}>
                <SectionTitleIcon>
                  <ProductLogo variant={ProductVariant.MevBlocker} theme="light" logoIconOnly />
                </SectionTitleIcon>
                <SectionTitleText textAlign="center" maxWidth={480}>
                  Don&apos;t let your users get burned by MEV
                </SectionTitleText>
                <SectionTitleDescription color={`var(${UI.COLOR_NEUTRAL_50})`}>
                  If you&apos;re a wallet, a solver, or any project that settles transactions on behalf of users, you
                  should integrate MEV Blocker to protect them from MEV and earn some extra revenue
                </SectionTitleDescription>

                <Link
                  bgColor={Color.cowfi_orange_bright}
                  color={Color.cowfi_orange_pale}
                  href="https://docs.cow.fi/mevblocker/searchers"
                  external
                  linkType={LinkType.SectionTitleButton}
                  utmContent="mev-blocker-learn-more"
                  data-click-event={toCowFiGtmEvent({
                    category: CowFiCategory.MEVBLOCKER,
                    action: 'Click Learn More',
                  })}
                >
                  Learn more
                </Link>
              </SectionTitleWrapper>
            </ContainerCardSection>
          </ContainerCard>

          <ContainerCard bgColor="transparent">
            <ContainerCardSection>
              <SectionTitleWrapper>
                <SectionTitleIcon $size={90}>
                  <LazySVG src={IMAGE_ICON_MEVBLOCKER_TRUST} />
                </SectionTitleIcon>
                <SectionTitleText>Trusted by the best</SectionTitleText>
              </SectionTitleWrapper>

              <TopicList columns={3}>
                {TRUSTED_BY_CONTENT.map((item) => (
                  <TopicCard
                    key={item.href}
                    contentAlign={'center'}
                    bgColor={`var(${UI.COLOR_NEUTRAL_98})`}
                    padding={'28px'}
                    href={item.href}
                    rel={'noopener noreferrer nofollow'}
                    target="_blank"
                    data-click-event={toCowFiGtmEvent({
                      category: CowFiCategory.MEVBLOCKER,
                      action: `Click Trusted By - ${item.href}`,
                    })}
                  >
                    <TopicImage
                      iconColor={`var(${UI.COLOR_NEUTRAL_20})`}
                      bgColor={'transparent'}
                      width={'90%'}
                      height={72}
                      margin={'auto'}
                    >
                      {item.component || <LazySVG src={item.src} />}
                    </TopicImage>
                  </TopicCard>
                ))}
              </TopicList>
            </ContainerCardSection>
          </ContainerCard>

          <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_100})`}>
            <ContainerCardSection>
              <SectionTitleWrapper>
                <SectionTitleIcon>
                  <LazySVG src={IMAGE_ICON_QUESTIONBALLOON} />
                </SectionTitleIcon>
                <SectionTitleText>FAQs</SectionTitleText>
              </SectionTitleWrapper>

              <FAQ faqs={FAQ_DATA} />
            </ContainerCardSection>
          </ContainerCard>

          <ContainerCard bgColor={Color.cowfi_orange_pale} touchFooter>
            <ContainerCardSection>
              <SectionTitleWrapper padding="72px 0" maxWidth={640}>
                <SectionTitleIcon>
                  <ProductLogo variant={ProductVariant.MevBlocker} theme="light" logoIconOnly />
                </SectionTitleIcon>
                <SectionTitleText textAlign="center">
                  Friends don&apos;t let friends suffer from MEV damage
                </SectionTitleText>

                <Link
                  linkType={LinkType.SectionTitleButton}
                  bgColor={Color.cowfi_orange_bright}
                  color={Color.cowfi_orange_pale}
                  onClick={handleShareClick}
                  asButton
                  data-click-event={toCowFiGtmEvent({
                    category: CowFiCategory.MEVBLOCKER,
                    action: 'Click Share',
                  })}
                >
                  Share MEV Blocker
                </Link>

                {message && <SectionTitleDescription fontSize={21}>{message}</SectionTitleDescription>}
              </SectionTitleWrapper>
            </ContainerCardSection>
          </ContainerCard>
        </PageWrapper>

        <Script src="https://platform.twitter.com/widgets.js" strategy="lazyOnload" />
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
