import { GetStaticProps } from 'next'
import { Font, Color, ProductLogo, ProductVariant } from '@cowprotocol/ui'

import styled from 'styled-components'

import { CONFIG } from '@/const/meta'

import Layout from '@/components/Layout'
import FAQ from '@/components/FAQ'
import { AddRpcButton } from '@/components/AddRpcButton'
import useWebShare from 'hooks/useWebShare'

import { WagmiConfig, createConfig, configureChains, mainnet } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

import IMAGE_ICON_MEVBLOCKER_PROTECT from '@cowprotocol/assets/images/icon-mevblocker-protect.svg'
import IMAGE_ICON_MEVBLOCKER_PROTECT2 from '@cowprotocol/assets/images/icon-mevblocker-protect2.svg'
import IMAGE_ICON_MEVBLOCKER_CHATBALLOON from '@cowprotocol/assets/images/icon-mevblocker-chatballoon.svg'
import IMAGE_ICON_MEVBLOCKER_TRUST from '@cowprotocol/assets/images/icon-mevblocker-trust.svg'
import IMAGE_ICON_QUESTIONBALLOON from '@cowprotocol/assets/images/icon-question-balloon.svg'

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
  HeroDescription,
  HeroContent,
  HeroTitle,
  HeroSubtitle,
  MetricsCard,
  MetricsItem,
  SectionTitleButton,
  ColorTable,
  ColorTableCell,
  ColorTableHeader,
  ColorTableContainer,
} from '@/styles/styled'

import SVG from 'react-inlinesvg'
import IMG_LOGO_SAFE from '@cowprotocol/assets/images/logo-safe.svg'
import IMG_LOGO_KARPATKEY from '@cowprotocol/assets/images/logo-karpatkey.svg'
import IMG_LOGO_BLOCKNATIVE from '@cowprotocol/assets/images/logo-blocknative.svg'
import IMG_LOGO_RABBY from '@cowprotocol/assets/images/logo-rabby.svg'
import IMG_LOGO_KEEPKEY from '@cowprotocol/assets/images/logo-keepkey.svg'
import IMG_LOGO_AMBIRE from '@cowprotocol/assets/images/logo-ambire.svg'
import IMG_LOGO_CRYPTO_COM from '@cowprotocol/assets/images/logo-crypto-com.svg'
import IMG_LOGO_UNISWAP from '@cowprotocol/assets/images/logo-uniswap.svg'

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

const TRUSTED_BY_CONTENT = [
  {
    href: 'https://uniswap.org/',
    src: IMG_LOGO_UNISWAP,
    title: 'Wallet',
  },
  {
    href: 'https://rabby.io/',
    src: IMG_LOGO_RABBY,
    title: 'Wallet',
  },
  {
    href: 'https://crypto.com/',
    src: IMG_LOGO_CRYPTO_COM,
    title: 'Wallet',
  },
  {
    href: 'https://swap.cow.fi/',
    component: <ProductLogo variant={ProductVariant.CowSwap} theme="dark" />,
    title: '',
  },
  {
    href: 'https://safe.global/',
    src: IMG_LOGO_SAFE,
    title: '',
  },
  {
    href: 'https://www.karpatkey.com/',
    src: IMG_LOGO_KARPATKEY,
    title: 'karpatkey',
  },
  {
    href: 'https://www.keepkey.com/',
    src: IMG_LOGO_KEEPKEY,
    title: '',
  },
  {
    href: 'https://www.ambire.com/',
    src: IMG_LOGO_AMBIRE,
    title: 'Wallet',
  },
  {
    href: 'https://www.blocknative.com/',
    src: IMG_LOGO_BLOCKNATIVE,
    title: 'Blocknative Transaction Boost',
  },
]

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
        <Layout
          bgColor={'#FEE7CF'}
          metaTitle="Mev Blocker - The best MEV protection under the sun"
          metaDescription="MEV Blocker is your personal protection from frontrunning and sandwich attacks for a broad spectrum of Ethereum transactions"
        >
          <Wrapper>
            <HeroContainer variant="secondary" maxWidth={1300} padding="0 20px 76px">
              <HeroContent variant="secondary">
                <HeroSubtitle color={'#EC4612'}>MEV Blocker</HeroSubtitle>
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

                <HeroButton background={'#EC4612'} color={'#FEE7CF'} href="#rpc">
                  Get protected
                </HeroButton>
              </HeroContent>
              <HeroImage width={470} height={470} color={'#EC4612'}>
                <ProductLogo height={'100%'} variant={ProductVariant.MevBlocker} theme="dark" logoIconOnly />
              </HeroImage>
            </HeroContainer>

            <MetricsCard bgColor="#EC4612" color="#FEE7CF" columns={3} touchFooter>
              <MetricsItem dividerColor="#F9A36F">
                <h2>$76B+</h2>
                <p>volume protected from MEV</p>
              </MetricsItem>
              <MetricsItem dividerColor="#F9A36F">
                <h2>2200 ETH</h2>
                <p>rebated to users</p>
              </MetricsItem>
              <MetricsItem>
                <h2>100%</h2>
                <p>of Ethereum's major builders use MEV Blocker</p>
              </MetricsItem>

              <SectionTitleButton
                bgColor="transparent"
                color="#FEE7CF"
                margin="24px auto 0"
                gridFullWidth
                href="https://dune.com/cowprotocol/mev-blocker"
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                View all metrics on DUNE &#8599;
              </SectionTitleButton>
            </MetricsCard>

            <ContainerCard bgColor={Color.neutral100}>
              <ContainerCardSection gap={60}>
                <SectionTitleWrapper color={Color.neutral10} maxWidth={1300} gap={56}>
                  <SectionTitleIcon multiple size={82}>
                    <SVG src={IMAGE_ICON_MEVBLOCKER_PROTECT} />
                  </SectionTitleIcon>
                  <SectionTitleText maxWidth={500}>Broad spectrum MEV defense</SectionTitleText>
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
                      <TopicDescription fontSize={28} color={'#FEE7CF'}>
                        Protection from frontrunning and sandwich attacks on all types of transactions
                      </TopicDescription>
                    </TopicCardInner>
                    <TopicImage
                      iconColor="#F2CD16"
                      bgColor="transparent"
                      margin={'auto auto 0 0'}
                      height={200}
                      width={'auto'}
                    >
                      <ProductLogo variant={ProductVariant.MevBlocker} logoIconOnly theme="dark" />
                    </TopicImage>
                  </TopicCard>

                  <TopicCard contentAlign={'left'} bgColor={'#EC4612'} padding={'32px'} asProp="div">
                    <TopicCardInner contentAlign="left">
                      <TopicDescription fontSize={28} color={'#FEE7CF'}>
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
                      <ProductLogo variant={ProductVariant.MevBlocker} logoIconOnly theme="dark" />
                    </TopicImage>
                  </TopicCard>

                  <TopicCard contentAlign={'left'} bgColor={'#EC4612'} padding={'32px'} asProp="div">
                    <TopicCardInner contentAlign="left">
                      <TopicDescription fontSize={28} color={'#FEE7CF'}>
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
                      <ProductLogo variant={ProductVariant.MevBlocker} logoIconOnly theme="dark" />
                    </TopicImage>
                  </TopicCard>
                </TopicList>

                <SectionTitleWrapper maxWidth={1200} margin="0 auto">
                  <SectionTitleDescription fontSize={28} color={Color.neutral50}>
                    Curious if you've been the victim of an MEV attack?{' '}
                    <a href="https://www.mevscanner.com/" target="_blank" rel="noopener noreferrer">
                      Use MEV Scanner
                    </a>{' '}
                    to find out
                  </SectionTitleDescription>
                </SectionTitleWrapper>
              </ContainerCardSection>
            </ContainerCard>

            <ContainerCard bgColor="transparent" color={Color.neutral10} id="rpc">
              <ContainerCardSection>
                <SectionTitleWrapper maxWidth={850} gap={56} margin="24px auto">
                  <SectionTitleIcon multiple size={82}>
                    <SVG src={IMAGE_ICON_MEVBLOCKER_PROTECT2} />
                  </SectionTitleIcon>
                  <SectionTitleText>Get Protected</SectionTitleText>
                  <SectionTitleDescription color={Color.neutral50}>
                    Add this RPC endpoint to your wallet to enjoy the full benefits of MEV Blocker.
                  </SectionTitleDescription>
                  <SectionTitleDescription fontSize={21} color={Color.neutral50}>
                    Note: some wallets make you reselect MEV Blocker every time you change networks.
                  </SectionTitleDescription>
                </SectionTitleWrapper>
                <TopicList columns={2}>
                  <TopicCard contentAlign={'left'} bgColor={Color.neutral100} padding={'32px'} asProp="div">
                    <TopicCardInner contentAlign="left">
                      <TopicTitle color={Color.neutral0} fontSize={28}>
                        Click to add to your client
                      </TopicTitle>
                      <TopicDescription fontSize={21}>MEV Blocker (Ethereum Mainnet)</TopicDescription>
                      <AddRpcButton />
                    </TopicCardInner>
                  </TopicCard>

                  <TopicCard contentAlign={'left'} bgColor={Color.neutral100} padding={'32px'} asProp="div">
                    <TopicCardInner contentAlign="left">
                      <TopicTitle color={Color.neutral0} fontSize={28}>
                        Add manually
                      </TopicTitle>
                      <TopicDescription fontSize={21}>
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
                <SectionTitleWrapper margin={'24px auto 0'}>
                  <SectionTitleDescription fontSize={28} color={Color.neutral50} maxWidth={700}>
                    Having trouble? Check your wallet's documentation for instructions on how to update your RPC
                    endpoint
                  </SectionTitleDescription>
                </SectionTitleWrapper>
              </ContainerCardSection>
            </ContainerCard>

            <ContainerCard bgColor={Color.neutral10} color={Color.neutral100}>
              <ContainerCardSection>
                <SectionTitleWrapper maxWidth={700}>
                  <SectionTitleIcon>
                    <ProductLogo variant={ProductVariant.MevBlocker} theme="dark" logoIconOnly />
                  </SectionTitleIcon>
                  <SectionTitleText>Multiple endpoints for multiple protection types</SectionTitleText>
                  <SectionTitleDescription color={Color.neutral50}>
                    Advanced MEV Blocker users can select from a variety of endpoints to suit their specific needs.
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
                        <ColorTableCell>/maxbackrun</ColorTableCell>
                        <ColorTableCell className="protected">Protected</ColorTableCell>
                        <ColorTableCell className="refund">Refund</ColorTableCell>
                        <ColorTableCell className="protected">Protected</ColorTableCell>
                      </tr>
                      <tr>
                        <ColorTableCell>/nochecks</ColorTableCell>
                        <ColorTableCell className="max-protection">Max protection</ColorTableCell>
                        <ColorTableCell className="no-rebate">No rebate</ColorTableCell>
                        <ColorTableCell className="protected">Protected</ColorTableCell>
                      </tr>
                    </tbody>
                  </ColorTable>
                </ColorTableContainer>

                <SectionTitleWrapper margin={'24px auto 0'}>
                  <SectionTitleDescription color={Color.neutral50}>
                    To learn more about each of the endpoints MEV Blocker has to offer,{' '}
                    <a href="https://docs.cow.fi/mevblocker" rel="noopener noreferrer" target="_blank">
                      read the MEV Blocker docs
                    </a>
                    .
                  </SectionTitleDescription>
                </SectionTitleWrapper>
              </ContainerCardSection>
            </ContainerCard>

            <ContainerCard bgColor={'transparent'}>
              <ContainerCardSection>
                <SectionTitleWrapper>
                  <SectionTitleIcon>
                    <SVG src={IMAGE_ICON_MEVBLOCKER_CHATBALLOON} />
                  </SectionTitleIcon>
                  <SectionTitleText>What others are saying...</SectionTitleText>
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

                  <TopicCard
                    contentAlign={'left'}
                    bgColor={Color.neutral100}
                    textColor="#EC4612"
                    padding={'24px'}
                    asProp="div"
                  >
                    <TopicCardInner height="100%" contentAlign="left" gap={52}>
                      <TopicTitle fontSize={28}>I was tired of getting rekt, so I started using MEV Blocker</TopicTitle>
                      <TopicDescription margin="auto 0 0" fontSize={21}>
                        – Anon
                      </TopicDescription>
                    </TopicCardInner>
                  </TopicCard>

                  <TopicCard
                    contentAlign={'left'}
                    bgColor={Color.neutral100}
                    textColor="#EC4612"
                    padding={'24px'}
                    asProp="div"
                  >
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

            <ContainerCard bgColor={Color.neutral100}>
              <ContainerCardSection>
                <SectionTitleWrapper maxWidth={900}>
                  <SectionTitleIcon>
                    <ProductLogo variant={ProductVariant.MevBlocker} theme="light" logoIconOnly />
                  </SectionTitleIcon>
                  <SectionTitleText textAlign="center" maxWidth={480}>
                    Don't let your users get burned by MEV
                  </SectionTitleText>
                  <SectionTitleDescription color={Color.neutral50}>
                    If you're a wallet, a solver, or any project that settles transactions on behalf of users, you
                    should integrate MEV Blocker to protect them from MEV and earn some extra revenue.
                  </SectionTitleDescription>

                  <SectionTitleButton
                    bgColor="#EC4612"
                    color={Color.neutral98}
                    href="https://docs.cow.fi/category/searchers"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more
                  </SectionTitleButton>
                </SectionTitleWrapper>
              </ContainerCardSection>
            </ContainerCard>

            <ContainerCard bgColor="transparent">
              <ContainerCardSection>
                <SectionTitleWrapper>
                  <SectionTitleIcon size={90}>
                    <SVG src={IMAGE_ICON_MEVBLOCKER_TRUST} />
                  </SectionTitleIcon>
                  <SectionTitleText>Trusted by the best</SectionTitleText>
                </SectionTitleWrapper>

                <TopicList columns={3}>
                  {TRUSTED_BY_CONTENT.map((item, index) => (
                    <TopicCard
                      key={index}
                      contentAlign={'center'}
                      bgColor={Color.neutral98}
                      padding={'28px'}
                      href={item.href}
                      rel={'noopener noreferrer nofollow'}
                      target="_blank"
                      gap={item.title ? 16 : undefined}
                    >
                      <TopicImage
                        iconColor={Color.neutral20}
                        bgColor={'transparent'}
                        width={'100%'}
                        height={72}
                        margin={'auto'}
                      >
                        {item.component || <SVG src={item.src} />}
                      </TopicImage>
                      {item.title && (
                        <TopicTitle fontSize={18} color={Color.neutral50} fontWeight={Font.weight.regular}>
                          {item.title}
                        </TopicTitle>
                      )}
                    </TopicCard>
                  ))}
                </TopicList>
              </ContainerCardSection>
            </ContainerCard>

            <ContainerCard bgColor={Color.neutral100}>
              <ContainerCardSection>
                <SectionTitleWrapper>
                  <SectionTitleIcon>
                    <SVG src={IMAGE_ICON_QUESTIONBALLOON} />
                  </SectionTitleIcon>
                  <SectionTitleText>FAQs</SectionTitleText>
                </SectionTitleWrapper>

                <FAQ faqs={FAQ_DATA} />
              </ContainerCardSection>
            </ContainerCard>

            <ContainerCard bgColor="#FEE7CF" touchFooter>
              <ContainerCardSection>
                <SectionTitleWrapper padding="72px 0" maxWidth={640}>
                  <SectionTitleIcon>
                    <ProductLogo variant={ProductVariant.MevBlocker} theme="light" logoIconOnly />
                  </SectionTitleIcon>
                  <SectionTitleText textAlign="center">
                    Friends don't let friends suffer from MEV damage
                  </SectionTitleText>

                  <SectionTitleButton bgColor="#EC4612" onClick={handleShareClick} as="div">
                    Share MEV Blocker
                  </SectionTitleButton>

                  {message && <SectionTitleDescription fontSize={21}>{message}</SectionTitleDescription>}
                </SectionTitleWrapper>
              </ContainerCardSection>
            </ContainerCard>
          </Wrapper>
          <script async src="https://platform.twitter.com/widgets.js"></script>
        </Layout>
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
