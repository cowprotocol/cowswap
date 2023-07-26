import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { NavLink } from 'react-router-dom'
import styled from 'styled-components/macro'

import { TradeUrlParams } from 'modules/trade/types/TradeRawState'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'

import { Routes } from 'common/constants/routes'
import { InlineBanner } from 'common/pure/InlineBanner'

const StyledNavLink = styled(NavLink)`
  color: inherit;
  display: inline;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

export interface TwapSuggestionBannerProps {
  slippage: Percent
  buyingFiatAmount: CurrencyAmount<Currency> | null
  tradeUrlParams: TradeUrlParams
}

const TWAP_SUGGESTION_SLIPPAGE_LIMIT = 1 // 1%
const TWAP_SUGGESTION_AMOUNT_LIMIT = 50_000 // $50,000

export function TwapSuggestionBanner({ slippage, buyingFiatAmount, tradeUrlParams }: TwapSuggestionBannerProps) {
  const shouldSuggestTwap =
    +slippage.toFixed(2) > TWAP_SUGGESTION_SLIPPAGE_LIMIT &&
    +(buyingFiatAmount?.toExact() || 0) > TWAP_SUGGESTION_AMOUNT_LIMIT

  if (!shouldSuggestTwap) return null

  const routePath = parameterizeTradeRoute(tradeUrlParams, Routes.ADVANCED_ORDERS)

  return (
    <InlineBanner type="alert">
      <p>
        Your slippage is {+slippage.toFixed(2)}%. Consider breaking up your order using{' '}
        <StyledNavLink to={routePath}>TWAP orders</StyledNavLink>
      </p>
    </InlineBanner>
  )
}
