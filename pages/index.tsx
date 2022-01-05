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
import { default as dark } from 'react-syntax-highlighter/dist/esm/styles/prism/coldark-dark';

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
          <h1>Batch Settlement layer for
            MEV protected trades</h1>
          <SubTitle lineHeight={2}>COW Protocol offers top DeFi rates with MEV protection by leveraging its Batch Settlement layer built on top of AMMs & DEX Aggregators. This layer allows Solvers (tx executors) to create CoWs (aka Coincidence of Wants) settlements without the need of liquidity pools, or use the pools as fallback mechanism when CoWs cannot be found.</SubTitle>

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
          <SubTitle align="center">Getting you better prices, MEV Protection, <br />no failed txs and gas costs savings through the batch settlemebt execution model. <ExternalLink href="#">View analytics</ExternalLink></SubTitle>
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
      <Section  flow={'column'} fullWidth id="about">
        <div>
          <SectionImage margin={'0 auto -6rem'}><img loading="lazy" src="/images/barn.jpg" alt="Meta DEX Aggregator" /></SectionImage>
        </div>

        <div className='container'>
          <h3>More than a meta DEX aggregator</h3>
          <IconList>
            <IconListItem icon="images/icons/equal.svg">
              <span>
                <b>Uniform clearing prices</b>
                <p>By using <a href="https://docs.cowswap.exchange/overview-1/batch-auctions" target="_blank" rel="noreferrer">batch auctions</a>, all trades within the same block are guaranteed to receive the same price regardless of their execution order.</p>
              </span >
            </IconListItem >

            <IconListItem icon="images/icons/puzzle.svg">
              <span>
                <b>Superior on-chain DeFi liquidity</b>
                <p>In order to give the best trading prices, existing and new liquidity sources are continuously being integrated.</p>
              </span>
            </IconListItem>

            <IconListItem icon="images/icons/relation.svg">
              <span>
                <b>Coincidence of Wants, CoWs (P2P trades)</b>
                <p>Direct P2P order liquidity matching improves the prices by reducing the need on liquidity pools.</p>
              </span>
            </IconListItem>

            <IconListItem icon="images/icons/timeMoney.svg">
              <span>
                <b>JIT (Just in time) Price</b>
                <p>Trades without ETH are made possible by having the solvers use either your sell or buy token, to pay for the transaction fees.</p>
              </span>
            </IconListItem>

            <IconListItem icon="images/icons/trading.svg">
              <span>
                <b>Professional Trading Execution Model</b>
                <p>Avoid any complexities related to gas estimations, failed transactions, or MEV attacks. Simply sign a message to submit a trading order.</p>
              </span>
            </IconListItem>

            <IconListItem icon="images/icons/gas.svg">
              <span>
                <b>Gas efficient trades</b>
                <p>By using batch auctions, trades are bundled together making them much more gas efficient.</p>
              </span>
            </IconListItem>

          </IconList >
        </div >
      </Section >

      {/* 4th section */}
      < Section className='container' flow={'column'} >
        <div>
          <h3>The life cycle of a CoW order</h3>
          <SubTitle align='center'>The protocol improves prices for users by batching trades, finding coincidence of wants (CoWs) <br className='hideMobile' />and tapping into all on chain liquidity - including aggregators.
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
            <p>Example, how to get a price and fee quotes for selling 10 ETH for USDC.</p>

            <ApiParams>
              <span><b>WETH</b><small>sellToken</small></span>
              <span><b>USDC</b><small>buyToken</small></span>
              <span><b>10</b><small>sellAmountBeforeFee</small></span>
            </ApiParams>

            <ApiCurlCommand>
              <SyntaxHighlighter language="json" style={dark}>
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
          <SubTitle>Directly interact with the COW protocol to place, manage and settle your orders through a documented API interface.</SubTitle>

          <CheckList>
            <li>Fetch Quotes</li>
            <li>Create and cancel limit orders</li>
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
          <h3>Your guardian in the dark forest</h3>

          <IconList>
            <IconListItem icon="images/icons/equal.svg">
              <span>
                <b>MEV Protection </b>
                <p>All CoW Protocol trades are protected from MEV (Miner/Maximal Extractable Value) as the risk is completely absorbed by the solver.</p>
              </span >
            </IconListItem >

            <IconListItem icon="images/icons/puzzle.svg">
              <span>
                <b>Superior on-chain prices</b>
                <p>Users have full control of the trade slippage. Solvers will respect the slippage you set and will not charge you for failed transactions.</p>
              </span>
            </IconListItem>

            <IconListItem icon="images/icons/relation.svg">
              <span>
                <b>CoW Trades (P2P)</b>
                <p>By using batch auctions, solvers can directly match different counterparties with each other. </p>
              </span>
            </IconListItem>

            <IconListItem icon="images/icons/relation.svg">
              <span>
                <b>Private Mempools</b>
                <p> Solvers leverage private mempools to avoid getting the batch settlement transactions caught in the dark forest.</p>
              </span>
            </IconListItem>
          </IconList >
        </div >
      </Section >

      {/* 7th section */}
      < Section flow={'column'} id="community" >
        <div>
          <h3>Join the community</h3>
          <SubTitle align={'center'} maxWidth={62}>Learn more about COW Protocol, chat with the team, others in the community, and have your say in shaping the future of decentralized finance.</SubTitle>
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
