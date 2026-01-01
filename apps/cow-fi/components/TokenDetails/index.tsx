import React, { JSX } from 'react'

import Image from 'next/image'

import { formatUSDPrice } from 'util/formatUSDPrice'

import {
  Wrapper,
  MainContent,
  StickyContent,
  SwapWidgetWrapper,
  SwapCardsWrapper,
  DetailHeading,
  Section,
  TokenTitle,
  TokenChart,
  NetworkTable,
  Stats,
  StatItem,
  StatTitle,
  StatValue,
} from './index.styles'

import type { TokenDetails as TokenDetailsType } from 'types'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ChartSection } from '@/components/ChartSection'
import { NetworkItem } from '@/components/NetworkItem'
import { NetworkHeaderItem } from '@/components/NetworkItem/styles'
import { SwapLinkCard } from '@/components/SwapLinkCard'
import { SwapWidget } from '@/components/SwapWidget'
import { Network, NETWORK_MAP } from '@/const/networkMap'

function TokenDetailsHeading(props: { token: TokenDetailsType }): JSX.Element {
  const { token } = props
  const { name, symbol, image } = token
  return (
    <DetailHeading>
      <TokenTitle>
        <Image src={image?.large ?? ''} alt={`${name} (${symbol})`} width={100} height={100} />
        <h1>{name}</h1>
        <span>{symbol}</span>
      </TokenTitle>
    </DetailHeading>
  )
}

function NetworkTableComponent(props: { token: TokenDetailsType }): JSX.Element {
  const { token } = props
  const { platforms, name, symbol } = token

  return (
    <NetworkTable>
      <NetworkHeaderItem>
        <div>Network</div>
        <div>Contract Address</div>
        <div></div>
      </NetworkHeaderItem>

      {Object.entries(platforms).map(
        ([network, platformData]) =>
          platformData.contractAddress &&
          network in NETWORK_MAP && (
            <NetworkItem
              key={`${network}-${platformData.contractAddress}`}
              network={network as Network}
              platformData={{
                address: platformData.contractAddress,
                decimals: platformData.decimalPlace,
                symbol,
                name,
              }}
            />
          ),
      )}
    </NetworkTable>
  )
}

function SwapCardsComponent(props: { token: TokenDetailsType }): JSX.Element {
  const {
    token: { platforms, symbol },
  } = props
  const { ethereum, xdai, base, 'arbitrum-one': arbitrum, avalanche, 'polygon-pos': polygon } = platforms

  return (
    <>
      <SwapCardsWrapper>
        {ethereum?.contractAddress && (
          <SwapLinkCard
            contractAddress={ethereum.contractAddress}
            networkId={1}
            network="ethereum"
            tokenSymbol={symbol}
          />
        )}

        {base?.contractAddress && (
          <SwapLinkCard contractAddress={base.contractAddress} networkId={8453} network="base" tokenSymbol={symbol} />
        )}

        {arbitrum?.contractAddress && (
          <SwapLinkCard
            contractAddress={arbitrum.contractAddress}
            networkId={42161}
            network="arbitrum-one"
            tokenSymbol={symbol}
          />
        )}

        {polygon?.contractAddress && (
          <SwapLinkCard
            contractAddress={polygon.contractAddress}
            networkId={137}
            network="polygon-pos"
            tokenSymbol={symbol}
          />
        )}

        {avalanche?.contractAddress && (
          <SwapLinkCard
            contractAddress={avalanche.contractAddress}
            networkId={43114}
            network="avalanche"
            tokenSymbol={symbol}
          />
        )}

        {xdai?.contractAddress && (
          <SwapLinkCard contractAddress={xdai.contractAddress} networkId={100} network="xdai" tokenSymbol={symbol} />
        )}
      </SwapCardsWrapper>
    </>
  )
}

export interface TokenDetailProps {
  token: TokenDetailsType
}

export function TokenDetails({ token }: TokenDetailProps): JSX.Element {
  const { id, name, symbol, image, marketCap, allTimeHigh, allTimeLow, volume, description, platforms } = token

  return (
    <Wrapper>
      <MainContent>
        <Breadcrumbs crumbs={[{ text: 'Tokens', href: '/tokens' }, { text: `${name} Price` }]} />

        <TokenDetailsHeading token={token} />

        <TokenChart>
          <ChartSection platforms={platforms} />
        </TokenChart>
        <Section>
          <TokenTitle>{symbol} Stats</TokenTitle>

          <Stats>
            <StatItem>
              <StatTitle>Market Cap</StatTitle>
              <StatValue>{formatUSDPrice(marketCap)}</StatValue>
            </StatItem>

            <StatItem>
              <StatTitle>24H Volume</StatTitle>
              <StatValue>{formatUSDPrice(volume)}</StatValue>
            </StatItem>

            <StatItem>
              <StatTitle>All-time High</StatTitle>
              <StatValue>{formatUSDPrice(allTimeHigh)}</StatValue>
            </StatItem>

            <StatItem>
              <StatTitle>All-time Low</StatTitle>
              <StatValue>{formatUSDPrice(allTimeLow)}</StatValue>
            </StatItem>
          </Stats>
        </Section>
        <Section>
          <h1>
            About {name} ({symbol}) token
          </h1>
          <div dangerouslySetInnerHTML={{ __html: description }}></div>

          <br />
          <br />

          <SwapCardsComponent token={token} />
        </Section>
        <Section>
          <h4>Explorers</h4>

          <NetworkTableComponent token={token} />
        </Section>
      </MainContent>

      <StickyContent>
        <SwapWidgetWrapper>
          <SwapWidget tokenSymbol={symbol} tokenImage={image?.large ?? ''} platforms={platforms} tokenId={id} />
        </SwapWidgetWrapper>
      </StickyContent>
    </Wrapper>
  )
}
