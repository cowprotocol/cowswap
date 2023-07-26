import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { NavLink } from 'react-router-dom'
import styled from 'styled-components/macro'

import { InfoIcon } from 'legacy/components/InfoIcon'

import { TradeUrlParams } from 'modules/trade/types/TradeRawState'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'

import { Routes } from 'common/constants/routes'
import { FiatAmount } from 'common/pure/FiatAmount'
import { InlineBanner } from 'common/pure/InlineBanner'
import { TokenAmount } from 'common/pure/TokenAmount'

export type SwapPriceDifferenceWarningProps = {
  amount: CurrencyAmount<Currency>
  feeFiatAmount: CurrencyAmount<Token> | null
  tradeUrlParams: TradeUrlParams
}

const StyledNavLink = styled(NavLink)`
  color: inherit;
  display: inline;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

export function SwapPriceDifferenceWarning({ tradeUrlParams, amount, feeFiatAmount }: SwapPriceDifferenceWarningProps) {
  const isTwapBetter = amount.greaterThan(0)

  if (!isTwapBetter && !feeFiatAmount) return null

  const routePath = parameterizeTradeRoute(tradeUrlParams, Routes.SWAP)
  const swapOrderLink = <StyledNavLink to={routePath}>SWAP order</StyledNavLink>

  return (
    <InlineBanner type={'savings'}>
      {isTwapBetter ? (
        <>
          <strong>Maximizing Your Gains! <InfoIcon content="TODO: set the tooltip content"></InfoIcon></strong>
          <p>
            You could gain an extra <b><TokenAmount amount={amount} tokenSymbol={amount.currency} /></b> compared to using a {swapOrderLink}
          </p>
        </>
      ) : (
        <>
          <strong>Trade Smart, Save More!</strong>
          <p>
            Considering current market fees (<b><FiatAmount amount={feeFiatAmount} /></b> per chunk), you could save more by reducing the number of parts or switch to a {swapOrderLink}.
          </p>
        </>
      )}
    </InlineBanner>
  )
}