import { ReactNode } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { mapSupportedNetworks, OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { InlineBanner, StatusColorVariant } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { Trans } from '@lingui/react/macro'
import { NavLink } from 'react-router'
import styled from 'styled-components/macro'

import { parameterizeTradeRoute, parameterizeTradeSearch, TradeUrlParams } from 'modules/trade'

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
  sellAmount: CurrencyAmount<Currency> | undefined | null
}

const PRICE_IMPACT_LIMIT = 1 // 1%

const AMOUNT_LIMIT: Record<SupportedChainId, number> = {
  ...mapSupportedNetworks(500), // $500 for most chains
  [SupportedChainId.MAINNET]: 50_000, // $50,000 for mainnet
}

export function TwapSuggestionBanner({
  priceImpact,
  buyingFiatAmount,
  tradeUrlParams,
  chainId,
  sellAmount,
}: TwapSuggestionBannerProps): ReactNode {
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

  const formattedPriceImpact = +priceImpact.toFixed(2)

  return (
    <InlineBanner bannerType={StatusColorVariant.Alert} iconSize={32}>
      <strong>
        <Trans>Minimize price impact with TWAP</Trans>
      </strong>
      <p>
        <Trans>
          The price impact is <b>{formattedPriceImpact}%</b>. Consider breaking up your order using a{' '}
          <StyledNavLink to={routePath}>TWAP order</StyledNavLink> and possibly get a better rate.
        </Trans>
      </p>
    </InlineBanner>
  )
}
