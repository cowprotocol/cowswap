import Head from 'next/head'
import { GetStaticProps } from 'next'
import { Font, Color, ProductLogo, ProductVariant } from '@cowprotocol/ui'
import IMG_COW_HERO_HOME from '@cowprotocol/assets/images/cow-hero-home.svg'
import IMG_ICON_GOVERNANCE from '@cowprotocol/assets/images/icon-governance.svg'

import styled from 'styled-components'

import { CONFIG } from '@/const/meta'

import Layout from '@/components/Layout'

import {
  ContainerCard,
  ContainerCardSection,
  TopicList,
  TopicCard,
  TopicImage,
  TopicTitle,
  TopicDescription,
  TopicButton,
  SectionTitleWrapper,
  SectionTitleIcon,
  SectionTitleText,
  SectionTitleDescription,
  TopicCardInner,
  HeroContainer,
  HeroBackground,
  HeroContent,
  HeroTitle,
  HeroSubtitle,
  SectionTitleButton,
} from '@/styles/styled'

import SVG from 'react-inlinesvg'
import IMG_ICON_BULB_COW from '@cowprotocol/assets/images/icon-bulb-cow.svg'
import IMG_ICON_GRANTS_CARTON from '@cowprotocol/assets/images/icon-grants-carton.svg'

const DATA_CACHE_TIME_SECONDS = 5 * 60 // Cache 5min

interface PageProps {
  siteConfigData: typeof CONFIG
}

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

export default function Page({ siteConfigData }: PageProps) {
  return (
    <Layout bgColor={Color.neutral90}>
      <Wrapper>
        <HeroContainer>
          <HeroBackground>
            <SVG src={IMG_COW_HERO_HOME} />
          </HeroBackground>
          <HeroContent>
            <HeroTitle fontSize={120}>Don&apos;t get milked!</HeroTitle>
          </HeroContent>
        </HeroContainer>

        <ContainerCard bgColor={Color.neutral100}>
          <ContainerCardSection>
            <SectionTitleWrapper color={Color.neutral0} maxWidth={1100} margin="100px auto">
              <SectionTitleText>
                CoW DAO develops the most user-protective products in Ethereum - so you can do more with less worry
              </SectionTitleText>
            </SectionTitleWrapper>

            <TopicList columns={2}>
              <TopicCard contentAlign={'left'} bgColor="#490072" textColor="#F996EE" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={51}>CoW Protocol</TopicTitle>
                  <TopicDescription fontSize={28} color="#F996EE">
                    Open-source, permissionless DEX aggregation protocol
                  </TopicDescription>
                  <TopicButton bgColor="#F996EE" color="#490072" href="/cow-protocol">
                    Start building
                  </TopicButton>
                </TopicCardInner>
                <TopicImage iconColor="#8702AA" bgColor="transparent" margin={'0 0 0 auto'} height={187} width={'auto'}>
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#65D9FF" textColor="#012F7A" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={51}>CoW Swap</TopicTitle>
                  <TopicDescription fontSize={28} color="#012F7A">
                    The DEX that lets you do what you want
                  </TopicDescription>
                  <TopicButton
                    bgColor="#012F7A"
                    color="#65D9FF"
                    href="https://swap.cow.fi/#/1/swap/USDC/COW"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Start trading
                  </TopicButton>
                </TopicCardInner>
                <TopicImage iconColor="#CCF8FF" bgColor="transparent" margin={'0 0 0 auto'} height={187} width={'auto'}>
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#194D06" textColor="#BCEC79" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={51}>CoW AMM</TopicTitle>
                  <TopicDescription fontSize={28} color="#BCEC79">
                    The first MEV-capturing AMM
                  </TopicDescription>
                  <TopicButton bgColor="#BCEC79" color="#194D06" href="/cow-amm">
                    Deposit liquidity
                  </TopicButton>
                </TopicCardInner>
                <TopicImage iconColor="#408A13" bgColor="transparent" margin={'0 0 0 auto'} height={187} width={'auto'}>
                  <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>

              <TopicCard contentAlign={'left'} bgColor="#FEE7CF" textColor="#EC4612" padding={'32px'} asProp="div">
                <TopicCardInner contentAlign="left">
                  <TopicTitle fontSize={51} fontWeight={Font.weight.bold}>
                    MEV Blocker
                  </TopicTitle>
                  <TopicDescription fontSize={28} color="#EC4612">
                    The best MEV protection RPC under the sun
                  </TopicDescription>
                  <TopicButton bgColor="#EC4612" color="#FEE7CF" href="/mev-blocker">
                    Get protected
                  </TopicButton>
                </TopicCardInner>
                <TopicImage iconColor="#FDC99F" bgColor="transparent" margin={'0 0 0 auto'} height={187} width={'auto'}>
                  <ProductLogo variant={ProductVariant.MevBlocker} logoIconOnly theme="dark" />
                </TopicImage>
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={'transparent'}>
          <ContainerCardSection>
            <SectionTitleWrapper maxWidth={900}>
              <SectionTitleIcon size={200}>
                <SVG src={IMG_ICON_BULB_COW} />
              </SectionTitleIcon>
              <SectionTitleText>Innovation in action</SectionTitleText>
              <SectionTitleDescription color={Color.neutral30}>
                CoW DAO is famous for pioneering technology at the forefront of intents, MEV protection, and more.{' '}
                <br />
                Whether you're a crypto beginner or an Ethereum OG, you can learn more about these important topics in
                the CoW DAO Knowledge Base.
              </SectionTitleDescription>

              <SectionTitleButton href="/learn">Learn more</SectionTitleButton>
            </SectionTitleWrapper>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={Color.neutral10} color={Color.neutral98}>
          <ContainerCardSection>
            <SectionTitleWrapper padding="150px 0 0" maxWidth={900}>
              <SectionTitleIcon size={200}>
                <SVG src={IMG_ICON_GOVERNANCE} />
              </SectionTitleIcon>
              <SectionTitleText textAlign="center">Governance</SectionTitleText>
              <SectionTitleDescription color={Color.neutral60} fontWeight={Font.weight.regular} textAlign="center">
                Anyone can join CoW DAO by holding{' '}
                <a href="https://swap.cow.fi/#/1/swap/USDC/COW" rel="noopener noreferrer" target="_blank">
                  COW tokens
                </a>
                . Tokenholders contribute to CoW DAO's mission by participating in "CoWmunity" discussions on Discord,
                by adding proposals to the CoW DAO Forum, and by voting on governance actions in Snapshot.
              </SectionTitleDescription>
            </SectionTitleWrapper>

            <TopicList columns={3}>
              <TopicCard
                textColor="#000000"
                href="https://discord.com/invite/cowprotocol"
                rel="noopener noreferrer"
                target="_blank"
              >
                <TopicImage iconColor="#1E90FF" large></TopicImage>
                <TopicTitle fontSize={38}>Discord</TopicTitle>
              </TopicCard>

              <TopicCard textColor="#000000" href="https://forum.cow.fi/" rel="noopener noreferrer" target="_blank">
                <TopicImage iconColor="#FF4500" large></TopicImage>
                <TopicTitle fontSize={38}>Forum</TopicTitle>
              </TopicCard>

              <TopicCard
                textColor="#000000"
                href="https://snapshot.org/#/cow.eth"
                rel="noopener noreferrer"
                target="_blank"
              >
                <TopicImage iconColor="#4B0082" large></TopicImage>
                <TopicTitle fontSize={38}>Snapshot</TopicTitle>
              </TopicCard>
            </TopicList>
          </ContainerCardSection>
        </ContainerCard>

        <ContainerCard bgColor={Color.neutral90} color={Color.neutral10} touchFooter>
          <ContainerCardSection>
            <SectionTitleWrapper maxWidth={900}>
              <SectionTitleIcon size={200}>
                <SVG src={IMG_ICON_GRANTS_CARTON} />
              </SectionTitleIcon>
              <SectionTitleText textAlign="center">Grants</SectionTitleText>
              <SectionTitleDescription color={Color.neutral30} fontWeight={Font.weight.regular} textAlign="center">
                The CoW DAO Grants Program funds mission-aligned projects and people working on MEV protection, trading
                innovation, and ecosystem development.
              </SectionTitleDescription>
              <SectionTitleButton href="https://grants.cow.fi/" rel="noopener noreferrer" target="_blank">
                Apply for a grant
              </SectionTitleButton>
            </SectionTitleWrapper>
          </ContainerCardSection>
        </ContainerCard>
      </Wrapper>
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
