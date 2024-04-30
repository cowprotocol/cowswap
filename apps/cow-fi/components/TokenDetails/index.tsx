import React from 'react'
import { Breadcrumbs } from '@/components/Breadcrumbs'
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
import { SwapWidget } from '@/components/SwapWidget'
import { SwapLinkCard } from '@/components/SwapLinkCard'
import { NetworkHeaderItem } from '@/components/NetworkItem/styles'
import { NetworkItem } from '@/components/NetworkItem'
import { InlineBanner } from '@/components/InlineBanner'
import { CONFIG } from '@/const/meta'
import { LinkWithUtm } from 'modules/utm'

import { ChartSection } from '@/components/ChartSection'
import { formatUSDPrice } from 'util/formatUSDPrice'
import type { TokenDetails as TokenDetailsType } from 'types'

export interface TokenDetailProps {
  token: TokenDetailsType
}

export function TokenDetails({ token }: TokenDetailProps) {
  const { id, name, symbol, image, marketCap, allTimeHigh, allTimeLow, volume, description, platforms } = token
  const contractAddressEthereum = platforms?.ethereum?.contractAddress
  const contractAddressGnosis = platforms?.xdai?.contractAddress

  return (
    <Wrapper>
      <MainContent>
        <Breadcrumbs crumbs={[{ text: 'Tokens', href: '/tokens' }, { text: `${name} Price` }]} />

        {/* TODO: Move InlineBanner content to be retrieved from token data */}
        {token.symbol === 'COW' && (
          <InlineBanner
            type="alert"
            content={
              <p>
                Read the latest updates impacting the COW token&nbsp;
                <LinkWithUtm
                  defaultUtm={{
                    ...CONFIG.utm,
                    utmContent: 'COW-tokenpage-banner-link',
                  }}
                  href="https://forum.cow.fi/t/cip-draft-testing-fee-models-for-cow-protocol/1984/3"
                  passHref
                >
                  <a target="_blank" rel="noreferrer">
                    on the forum
                  </a>
                </LinkWithUtm>
              </p>
            }
          />
        )}
        {/* ============================================================== */}

        <DetailHeading>
          <TokenTitle>
            <img src={image.large} alt={`${name} (${symbol})`} />
            <h1>{name}</h1>
            <span>{symbol}</span>
          </TokenTitle>
        </DetailHeading>
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

          <SwapCardsWrapper>
            {contractAddressEthereum && (
              <SwapLinkCard
                contractAddress={contractAddressEthereum}
                networkId={1}
                networkName="Ethereum"
                tokenSymbol={symbol}
              />
            )}

            {contractAddressGnosis && (
              <SwapLinkCard
                contractAddress={contractAddressGnosis}
                networkId={100}
                networkName="Gnosis Chain"
                tokenSymbol={symbol}
              />
            )}
          </SwapCardsWrapper>
        </Section>
        <Section>
          <h4>Explorers</h4>

          <NetworkTable>
            <NetworkHeaderItem>
              <div>Network</div>
              <div>Contract Address</div>
              <div></div>
            </NetworkHeaderItem>

            {Object.entries(platforms).map(
              ([network, platformData]) =>
                platformData.contractAddress && (
                  <NetworkItem
                    key={`${network}-${platformData.contractAddress}`}
                    network={network}
                    platformData={{
                      address: platformData.contractAddress,
                      decimals: platformData.decimalPlace,
                      symbol,
                      name,
                    }}
                  />
                )
            )}
          </NetworkTable>
        </Section>
      </MainContent>

      <StickyContent>
        <SwapWidgetWrapper>
          <SwapWidget tokenSymbol={symbol} tokenImage={image.large} platforms={platforms} tokenId={id} />
        </SwapWidgetWrapper>
      </StickyContent>
    </Wrapper>
  )
}
