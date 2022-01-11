import Head from 'next/head'
import { GetStaticProps } from 'next'
import { useRef } from 'react'

import { ExternalLink } from '@/const/styles/global'
import { siteConfig } from '@/const/meta'
import metrics from '@/const/metrics'
import { GET_QUOTE } from '@/const/api'

import Layout from '@/components/Layout'
import { ButtonWrapper } from '@/components/Button'
import CowSlider, { CowSliderWrapper } from '@/components/CowSlider'
import { Section, SubTitle, SectionImage, IconList, IconListItem, Metrics, CheckList, ApiWrapper, ApiTool, ApiCurlCommand, ApiParams } from '../const/styles/pages/index'
import SocialList from '@/components/SocialList'
import Button from '@/components/Button'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { default as dark } from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';

export default function Home({ metricsData, siteConfigData }) {
  const { title, descriptionShort, social, url } = siteConfigData

  const scrollToElRef = useRef(null);

  const handleScrollDown = () => {
    scrollToElRef.current.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Layout>

      <Head>
        <title>{title} - {descriptionShort}</title>
      </Head>

      {/* Hero/1st section */}
      <Section className='container' hero>
        <div>
          <h1>The Settlement Layer for
            Decentralized Trading</h1>
          <SubTitle lineHeight={2}>CoW Protocol lets people swap assets MEV protected at the best exchange rate  by leveraging its batch settlement layer built on top of DeFi’s favorite AMMs and DEX Aggregators. Instead of directly executing trades on-chain, users only sign their swap intention and delegate the execution to so-called solvers (aka relayers in other protocols). Solvers bid on the best possible exchange rate in order to win the right to settle trades. By batching multiple trades together in order to create CoWs (Coincidence of Wants), solvers can save on gas costs, AMM fees and execution risk. Therefore CoWs lead to structurally better prices than on any existing DEX aggregator. In the absence of CoWs solvers fall back to using the best possible on-chain route, by comparing quotes from leading aggregators.</SubTitle>

          <ButtonWrapper>
            <Button href={url.docs} target="_blank" label="Documentation" />
            <Button variant='white' href={url.analytics} label='Analytics' target="_blank" rel="noopener nofollow" />
          </ButtonWrapper>
        </div>
        <CowSliderWrapper>
          <CowSlider />
        </CowSliderWrapper>
      </Section>

      {/* 2nd section */}
      <Section ref={scrollToElRef} flow={'column'}>
        <div>
          <SectionImage margin={'0 auto -18rem'} height={'68rem'}><img loading="lazy" src="/images/cowBelt.jpg" alt="A fast growing protocol" /></SectionImage>
          <h2>A fast-growing trading protocol</h2>
          <SubTitle align="center">Trade on CoW Protocol for <br /> better prices, gas cost savings and extra secure MEV protection <ExternalLink href="#">View analytics</ExternalLink></SubTitle>
          <Metrics>
            {metricsData.map(({ label, value }, i) =>
              <div key={i}>
                <b>{value}</b>
                <i>{label}</i>
              </div>
            )}
          </Metrics>
        </div>
      </Section>

      {/* 3rd section */}
      <Section flow={'column'} fullWidth id="about">
        <div>
          <SectionImage margin={'0 auto -6rem'}><img loading="lazy" src="/images/barn.jpg" alt="Meta DEX Aggregator" /></SectionImage>
        </div>

        <div className='container'>
          <h3>More than a Meta DEX Aggregator</h3>
          <IconList>
            
            <IconListItem icon="images/icons/puzzle.svg">
              <span>
                <b>Best On-Chain Prices</b>
                <p>By leveraging any on-chain liquidity sources we are able to provide the best on-chain prices.</p>
              </span>
            </IconListItem>
            
            <IconListItem icon="images/icons/trading.svg">
              <span>
                <b>Professional Transaction Execution</b>
                <p>Meta-transactions ensure that traders do not pay for failed transactions. They also facilitate automatic resubmission of failed orders.</p>
              </span>
            </IconListItem>

            <IconListItem icon="images/icons/relation.svg">
              <span>
                <b>Coincidence of Wants (CoWs)</b>
                <p>CoWs, simply put as peer-to-peer trades, improve the prices by reducing the need for liquidity pools. This saves the traders money spent on protocol fees, slippage, and gas fees.</p>
              </span>
            </IconListItem>

            <IconListItem icon="images/icons/shield.svg">
              <span>
                <b>MEV Mitigation</b>
                <p>Trades are protected against MEV in multiple layers: via Coincidence of Wants (CoWs) and leveraging both Flashbots Protect RPC and the Eden Network.</p>
              </span>
            </IconListItem>

            <IconListItem icon="images/icons/equal.svg">
              <span>
                <b>Same Block, Same Price</b>
                <p>All trades within the same block are guaranteed to receive the same price regardless of their execution order.</p>
              </span >
            </IconListItem >

            <IconListItem icon="images/icons/gas.svg">
              <span>
                <b>ETH-less Trading Experience</b>
                <p>Traders pay fees in their sell tokens. No need to spend your precious ETH.</p>
              </span>
            </IconListItem>

          </IconList >
        </div >
      </Section >

      {/* 4th section */}
      < Section className='container' flow={'column'} >
        <div>
          <h3>The life cycle of a CoW order</h3>
          <SubTitle align='center'>The protocol improves prices for traders by batching trades, finding Coincidence of Wants (CoWs) <br className='hideMobile' />and tapping into all on-chain liquidity, including aggregators.
            {' '}<a href="https://docs.cowswap.exchange/overview-1/coincidence-of-wants" target="_blank" rel="noreferrer">Read More</a></SubTitle>
          <SectionImage margin={'0'}>
            <a href="/images/how-it-works.jpg" target="_blank" rel="nofollow noopener"><img loading="lazy" src="/images/how-it-works.jpg" alt="How it works" /></a>
            <ButtonWrapper className="mobileOnly"><Button label={'View Full Image'} href="/images/how-it-works.jpg" target="_blank" rel="nofollow noopener" /></ButtonWrapper>
          </SectionImage >
        </div >
      </Section >

      {/* 5th section */}
      <Section className='container' breakMedium mediumSwitchOrder mobileSwitchOrder id="developers">
        <ApiWrapper>
          <ApiTool>
            <h4>Get a price quote</h4>
            <p>Example, how to get a price and fee quote for selling 10 ETH for USDC.</p>

            <ApiParams>
              <span><b>WETH</b><small>sellToken</small></span>
              <span><b>USDC</b><small>buyToken</small></span>
              <span><b>10</b><small>sellAmountBeforeFee</small></span>
            </ApiParams>

            <ApiCurlCommand>
              <SyntaxHighlighter language="json" style={dark} customStyle={{margin: 0, borderRadius: '1.2rem'}}>
                {GET_QUOTE}
              </SyntaxHighlighter>
            </ApiCurlCommand>
          </ApiTool>
        </ApiWrapper>
        <div>
          <SectionImage centerMobile margin={"0 0 -4rem -1rem"} width={"10rem"} height={"10rem"}>
            <img loading="lazy" src="/images/icons/plug.svg" alt="Plug-n-play" />
          </SectionImage >

          <h3>Plug-n-play trading protocol with just a few lines of code</h3>
          <SubTitle>Directly interact with the CoW protocol to place, manage and settle your orders through a documented API interface.</SubTitle>

          <CheckList>
            <li>Fetch Quotes.</li>
            <li>Create and cancel limit orders.</li>
            <li>Manage orders across Ethereum, Rinkeby and Gnosis Chain.</li>
          </CheckList>

          <ButtonWrapper>
            <Button href={url.apiDocs} label='Explore API Docs' target="_blank" rel="noopener nofollow" />
            <Button href={url.docs} label="Documentation" target="_blank" rel="noopener nofollow" variant='white' />
          </ButtonWrapper>
        </div >
      </Section >

      {/* 6th section */}
      < Section flow={'column'} fullWidth >
        <div>
          <SectionImage margin={'0 0 -7rem'} height={'78rem'}>
            <img loading="lazy" src="/images/cow-dark-forest.jpg" alt="Guardian in the dark forest" />
          </SectionImage >
        </div >

        <div className='container'>
          <h3>Your Guardian in the Dark Forest</h3>
        </div >
      </Section >

      {/* 7th section */}
      < Section flow={'column'} id="community" >
        <div>
          <h3>Join the CoWmunity</h3>
          <SubTitle align={'center'} maxWidth={62}>Learn more about CoW Protocol, chat with the team, others in the community, and have your say in shaping the future of decentralized finance.</SubTitle>
          <SocialList social={social} />
        </div>
      </Section >

    </Layout >
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const siteConfigData = siteConfig
  const { social } = siteConfig
  const metricsData = metrics

  return {
    props: { metricsData, siteConfigData, social }
  }
}
