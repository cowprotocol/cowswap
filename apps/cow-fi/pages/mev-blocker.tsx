import Head from 'next/head'
import { GetStaticProps } from 'next'
import { Color, ProductLogo, ProductVariant } from '@cowprotocol/ui'
import IMG_ICON_CROWN_COW from '@cowprotocol/assets/images/icon-crown-cow.svg'

import styled from 'styled-components'

import { CONFIG } from '@/const/meta'

import LayoutV2 from '@/components/Layout/LayoutV2'
import FAQ from '@/components/FAQ'
import { AddRpcButton } from '@/components/AddRpcButton'

import { WagmiConfig, createConfig, configureChains, mainnet } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

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
  HeroButton,
  HeroButtonWrapper,
  HeroDescription,
  HeroContent,
  HeroTitle,
  HeroSubtitle,
  MetricsCard,
  MetricsItem,
  SectionTitleButton,
} from '@/styles/styled'

import SVG from 'react-inlinesvg'
import IMG_ICON_FAQ from '@cowprotocol/assets/images/icon-faq.svg'
import { Section } from '@/components/TokenDetails/index.styles'

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

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  max-width: 1600px;
  width: 100%;
  margin: 76px auto 0;
  gap: 24px;
`

// Configure chains and providers
const { chains, publicClient } = configureChains([mainnet], [publicProvider()])

// Get default wallets
const { connectors } = getDefaultWallets({
  appName: 'Your App Name',
  projectId: 'YOUR_PROJECT_ID', // TODO: Add project ID here
  chains,
})

// Create the Wagmi client
const wagmiClient = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

interface PageProps {
  siteConfigData: typeof CONFIG
}

export default function Page({ siteConfigData }: PageProps) {
  return (
    <WagmiConfig config={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <LayoutV2 bgColor={'#3FC4FF'}>
          <Head>
            <title>
              {siteConfigData.title} - {siteConfigData.descriptionShort}
            </title>
          </Head>

          <Wrapper>
            <HeroContainer variant="secondary" maxWidth={1300} padding={'0 0 75px'}>
              <HeroContent variant="secondary">
                <HeroSubtitle color={'#EC4612'}>MEV Blocker</HeroSubtitle>
                <HeroTitle fontSize={51} fontSizeMobile={38} as="h2">
                  The best MEV protection under the sun
                </HeroTitle>
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

                <HeroButtonWrapper>
                  <HeroButton background={'#EC4612'} color={'#FEE7CF'} href="/">
                    Get protected
                  </HeroButton>

                  <HeroButton background="transparent" color={Color.neutral20} href="#">
                    Integrate MEV Blocker
                  </HeroButton>
                </HeroButtonWrapper>
              </HeroContent>
              <HeroImage width={470} height={470} color={'#EC4612'}>
                <SVG src={IMG_ICON_CROWN_COW} />
              </HeroImage>
            </HeroContainer>

            <MetricsCard bgColor="#FEE7CF" color="#EC4612" columns={3} touchFooter>
              <MetricsItem dividerColor="#F9A36F">
                <h2>18</h2>
                <p>active solvers settling batches</p>
              </MetricsItem>
              <MetricsItem dividerColor="#F9A36F">
                <h2>1 in 4</h2>
                <p>user trades go through CoW Protocol</p>
              </MetricsItem>
              <MetricsItem>
                <h2>83</h2>
                <p>average NPS score for users of CoW Protocol</p>
              </MetricsItem>

              <SectionTitleButton
                bgColor="#EC4612"
                color="#FEE7CF"
                margin="56px auto 0"
                gridFullWidth
                href="https://dune.com/cowprotocol/mev-blocker"
                target="_blank"
                rel="noopener noreferrer"
              >
                View metrics on DUNE
              </SectionTitleButton>
            </MetricsCard>

            <ContainerCard bgColor={Color.neutral98}>
              <ContainerCardSection gap={90}>
                <SectionTitleWrapper color={Color.neutral0} maxWidth={1300} gap={56}>
                  <SectionTitleIcon multiple size={80}>
                    <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly />
                  </SectionTitleIcon>
                  <SectionTitleText maxWidth={900}>Broad spectrum MEV defense</SectionTitleText>
                  <SectionTitleDescription maxWidth={'100%'} color={Color.neutral50}>
                    MEV bots have extracted more than{' '}
                    <a href="https://dune.com/queries/2259793/3703605" target="_blank" rel="noopener noreferrer">
                      $1.38 billion
                    </a>{' '}
                    from well-meaning Ethereum users across a variety of use cases (trading, providing liquidity,
                    minting NFTs, etc). MEV Blocker is an RPC endpoint that supports these users by offering:
                  </SectionTitleDescription>
                </SectionTitleWrapper>

                <TopicList columns={3}>
                  <TopicCard contentAlign={'left'} bgColor={'#EC4612'} padding={'32px'} asProp="div">
                    <TopicCardInner contentAlign="left">
                      <TopicDescription fontSize={28} color={Color.neutral95}>
                        Full protection from frontrunning and sandwich attacks on all types of transactions
                      </TopicDescription>
                    </TopicCardInner>
                    <TopicImage
                      iconColor="#F2CD16"
                      bgColor="transparent"
                      margin={'auto auto 0 0'}
                      height={200}
                      width={'auto'}
                    >
                      <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                    </TopicImage>
                  </TopicCard>

                  <TopicCard contentAlign={'left'} bgColor={'#EC4612'} padding={'32px'} asProp="div">
                    <TopicCardInner contentAlign="left">
                      <TopicDescription fontSize={28} color={Color.neutral95}>
                        Profit from any backrunning opportunities your transactions create
                      </TopicDescription>
                    </TopicCardInner>
                    <TopicImage
                      iconColor="#F2CD16"
                      bgColor="transparent"
                      margin={'auto auto 0 0'}
                      height={200}
                      width={'auto'}
                    >
                      <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                    </TopicImage>
                  </TopicCard>

                  <TopicCard contentAlign={'left'} bgColor={'#EC4612'} padding={'32px'} asProp="div">
                    <TopicCardInner contentAlign="left">
                      <TopicDescription fontSize={28} color={Color.neutral95}>
                        A fast, free, censorship-resistant solution open to all searchers and builders
                      </TopicDescription>
                    </TopicCardInner>
                    <TopicImage
                      iconColor="#F2CD16"
                      bgColor="transparent"
                      margin={'auto auto 0 0'}
                      height={200}
                      width={'auto'}
                    >
                      <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                    </TopicImage>
                  </TopicCard>
                </TopicList>
              </ContainerCardSection>

              <SectionTitleWrapper maxWidth={600}>
                <SectionTitleText fontSize={42}>Curious if you've been the victim of an MEV attack?</SectionTitleText>
                <SectionTitleButton
                  bgColor="#EC4612"
                  color="#FEE7CF"
                  href="https://www.mevscanner.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Use MEV Scanner to find out
                </SectionTitleButton>
              </SectionTitleWrapper>
            </ContainerCard>

            <ContainerCard bgColor={'transparent'} color={Color.neutral10}>
              <ContainerCardSection>
                <SectionTitleWrapper maxWidth={800} gap={56}>
                  <SectionTitleIcon multiple size={80}>
                    <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly />
                  </SectionTitleIcon>

                  <SectionTitleText>Get Protected</SectionTitleText>
                  <SectionTitleDescription>
                    Add this RPC endpoint to your wallet to enjoy the full benefits of MEV Blocker
                  </SectionTitleDescription>
                </SectionTitleWrapper>
                <TopicList columns={2}>
                  <TopicCard contentAlign={'left'} bgColor={Color.neutral100} padding={'32px'} asProp="div">
                    <TopicCardInner contentAlign="left">
                      <TopicTitle color={Color.neutral0} fontSize={38}>
                        Click to add to your client
                      </TopicTitle>
                      <TopicDescription fontSize={28} color={Color.neutral0}>
                        MEV Blocker (Ethereum Mainnet)
                      </TopicDescription>
                      <AddRpcButton />
                    </TopicCardInner>
                  </TopicCard>

                  <TopicCard contentAlign={'left'} bgColor={Color.neutral100} padding={'32px'} asProp="div">
                    <TopicCardInner contentAlign="left">
                      <TopicTitle color={Color.neutral0} fontSize={38}>
                        Add manually
                      </TopicTitle>
                      <TopicDescription fontSize={24} color={Color.neutral0}>
                        <table>
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
                        </table>
                      </TopicDescription>
                    </TopicCardInner>
                  </TopicCard>
                </TopicList>
                <SectionTitleWrapper margin={'56px auto'}>
                  <SectionTitleDescription fontSize={28} color={Color.neutral0} maxWidth={700}>
                    Having trouble? Check your wallet's documentation for instructions on how to update your RPC
                    endpoint
                  </SectionTitleDescription>
                </SectionTitleWrapper>
              </ContainerCardSection>
            </ContainerCard>

            <ContainerCard bgColor={Color.neutral10} color={Color.neutral98}>
              <ContainerCardSection>
                <SectionTitleWrapper padding="150px 0 56px">
                  <SectionTitleIcon size={100}>
                    <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly />
                  </SectionTitleIcon>
                  <SectionTitleText fontSize={90}>What others are saying...</SectionTitleText>
                </SectionTitleWrapper>

                <TopicList columns={3}>
                  <TopicCard
                    contentAlign={'left'}
                    bgColor="#3FC4FF"
                    textColor={Color.neutral0}
                    padding={'24px'}
                    asProp="div"
                  >
                    <TopicCardInner height="100%" contentAlign="left" gap={52}>
                      <TopicTitle fontSize={28}>MEV Blocker fixed my marriage!</TopicTitle>
                      <TopicDescription margin="auto 0 0" fontSize={21}>
                        – Anon
                      </TopicDescription>
                    </TopicCardInner>
                  </TopicCard>

                  <TopicCard contentAlign={'left'} bgColor="#EC4612" textColor="#FEE7CF" padding={'24px'} asProp="div">
                    <TopicCardInner height="100%" contentAlign="left" gap={52}>
                      <TopicTitle fontSize={28}>
                        If I'd known about MEV Blocker sooner, I could've had a lambo by now
                      </TopicTitle>
                      <TopicDescription margin="auto 0 0" fontSize={21}>
                        – Anon
                      </TopicDescription>
                    </TopicCardInner>
                  </TopicCard>

                  <TopicCard contentAlign={'left'} bgColor="#FEE7CF" textColor="#EC4612" padding={'24px'} asProp="div">
                    <TopicCardInner height="100%" contentAlign="left" gap={52}>
                      <TopicTitle fontSize={28}>I was tired of getting rekt, so I started using MEV Blocker</TopicTitle>
                      <TopicDescription margin="auto 0 0" fontSize={21}>
                        – Anon
                      </TopicDescription>
                    </TopicCardInner>
                  </TopicCard>

                  <TopicCard contentAlign={'left'} bgColor="#FEE7CF" textColor="#EC4612" padding={'24px'} asProp="div">
                    <TopicCardInner height="100%" contentAlign="left" gap={52}>
                      <TopicTitle fontSize={28}>Robots should work for me, not against me</TopicTitle>
                      <TopicDescription margin="auto 0 0" fontSize={21}>
                        – Anon
                      </TopicDescription>
                    </TopicCardInner>
                  </TopicCard>

                  <TopicCard contentAlign={'left'} bgColor="#F2CD16" textColor="#EC4612" padding={'24px'} asProp="div">
                    <TopicCardInner height="100%" contentAlign="left" gap={52}>
                      <TopicTitle fontSize={28}>
                        Nobody's stolen my lunch money since I started using MEV Blocker
                      </TopicTitle>
                      <TopicDescription margin="auto 0 0" fontSize={21}>
                        – Anon
                      </TopicDescription>
                    </TopicCardInner>
                  </TopicCard>

                  <TopicCard contentAlign={'left'} bgColor="#EC4612" textColor="#F2CD16" padding={'24px'} asProp="div">
                    <TopicCardInner height="100%" contentAlign="left" gap={52}>
                      <TopicTitle fontSize={28}>I used MEV Blocker and I instantly went up a tax bracket</TopicTitle>
                      <TopicDescription margin="auto 0 0" fontSize={21}>
                        – Anon
                      </TopicDescription>
                    </TopicCardInner>
                  </TopicCard>
                </TopicList>
              </ContainerCardSection>
            </ContainerCard>

            <ContainerCard bgColor={'transparent'} color={Color.neutral10}>
              <ContainerCardSection>
                <SectionTitleWrapper padding="150px 0 0" maxWidth={1300}>
                  <SectionTitleIcon size={100}>
                    <ProductLogo variant={ProductVariant.CowProtocol} theme="light" logoIconOnly />
                  </SectionTitleIcon>
                  <SectionTitleText fontSize={90} textAlign="center">
                    Don&apos;t let your friends get burned by MEV
                  </SectionTitleText>

                  <SectionTitleButton bgColor="#EC4612" color="#FEE7CF" href="/">
                    Add to wallet
                  </SectionTitleButton>
                </SectionTitleWrapper>
              </ContainerCardSection>
            </ContainerCard>

            <ContainerCard bgColor={'#EC4612'} color="#FEE7CF">
              <ContainerCardSection>
                <SectionTitleWrapper>
                  <SectionTitleIcon size={100}>
                    <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly />
                  </SectionTitleIcon>
                  <SectionTitleText fontSize={90} textAlign="center">
                    Jointly formulated
                  </SectionTitleText>
                </SectionTitleWrapper>

                <TopicList columns={3}>
                  <TopicCard bgColor="#FEE7CF" textColor="#EC4612" href="/">
                    <TopicImage iconColor="#EC4612" large></TopicImage>
                    <TopicTitle fontSize={38}>Agnostic Relay</TopicTitle>
                  </TopicCard>

                  <TopicCard bgColor="#FEE7CF" textColor="#EC4612" href="/">
                    <TopicImage iconColor="#EC4612" large></TopicImage>
                    <TopicTitle fontSize={38}>Beaver Build</TopicTitle>
                  </TopicCard>

                  <TopicCard bgColor="#FEE7CF" textColor="#EC4612" href="/">
                    <TopicImage iconColor="#EC4612" large></TopicImage>
                    <TopicTitle fontSize={38}>CoW DAO</TopicTitle>
                  </TopicCard>
                </TopicList>
              </ContainerCardSection>
            </ContainerCard>

            <ContainerCard bgColor={Color.neutral90} color={Color.neutral20} touchFooter>
              <ContainerCardSection padding={'0 0 100px'}>
                <SectionTitleWrapper>
                  <SectionTitleIcon>
                    <SVG src={IMG_ICON_FAQ} />
                  </SectionTitleIcon>
                  <SectionTitleText>FAQs</SectionTitleText>
                </SectionTitleWrapper>

                <FAQ faqs={FAQ_DATA} />
              </ContainerCardSection>
            </ContainerCard>
          </Wrapper>
          <script async src="https://platform.twitter.com/widgets.js"></script>
        </LayoutV2>
      </RainbowKitProvider>
    </WagmiConfig>
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
