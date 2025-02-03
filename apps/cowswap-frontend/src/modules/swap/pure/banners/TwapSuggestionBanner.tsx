import { getIsNativeToken } from '@cowprotocol/common-utils'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { InlineBanner } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { NavLink } from 'react-router-dom'
import styled from 'styled-components/macro'

import { TradeUrlParams } from 'modules/trade/types/TradeRawState'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'
import { parameterizeTradeSearch } from 'modules/trade/utils/parameterizeTradeSearch'

import { Routes } from 'common/constants/routes'

const StyledNavLink = styled(NavLink)`
  color: inherit;
  display: inline;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

export interface TwapSuggestionBannerProps {
  chainId: SupportedChainId
  priceImpact: Percent | undefined
  buyingFiatAmount: CurrencyAmount<Currency> | null
  tradeUrlParams: TradeUrlParams
  sellAmount: CurrencyAmount<Currency> | undefined
}

const PRICE_IMPACT_LIMIT = 1 // 1%
const AMOUNT_LIMIT: Record<SupportedChainId, number> = {
  [SupportedChainId.MAINNET]: 50_000, // $50,000
  [SupportedChainId.GNOSIS_CHAIN]: 500, // $500
  [SupportedChainId.ARBITRUM_ONE]: 500, // $500
  [SupportedChainId.BASE]: 500, // $500
  [SupportedChainId.SEPOLIA]: 100, // $100
}

export function TwapSuggestionBanner({
  priceImpact,
  buyingFiatAmount,
  tradeUrlParams,
  chainId,
  sellAmount,
}: TwapSuggestionBannerProps) {
  if (!priceImpact || priceImpact.lessThan(0)) return null

  const isSellNative = !!sellAmount?.currency && getIsNativeToken(sellAmount?.currency)
  const priceImpactIsHighEnough = +priceImpact.toFixed(2) > PRICE_IMPACT_LIMIT
  const buyAmountIsBigEnough = +(buyingFiatAmount?.toExact() || 0) > AMOUNT_LIMIT[chainId]

  const shouldSuggestTwap = !isSellNative && priceImpactIsHighEnough && buyAmountIsBigEnough

  if (!shouldSuggestTwap) return null

  const routePath =
    parameterizeTradeRoute(tradeUrlParams, Routes.ADVANCED_ORDERS) +
    '?' +
    parameterizeTradeSearch('', {
      amount: sellAmount?.toExact(),
      kind: OrderKind.SELL,
    })

  return (
    <InlineBanner bannerType="alert" iconSize={32}>
      <strong>Minimize price impact with TWAP</strong>
      <p>
        The price impact is <b>{+priceImpact.toFixed(2)}%</b>. Consider breaking up your order using a{' '}
        <StyledNavLink to={routePath}>TWAP order</StyledNavLink> and possibly get a better rate.
      </p>
    </InlineBanner>
  )
}
