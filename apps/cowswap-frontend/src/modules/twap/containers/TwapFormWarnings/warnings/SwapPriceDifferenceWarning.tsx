import { ReactNode } from 'react'

import { FiatAmount, InlineBanner, StatusColorVariant, TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Trans } from '@lingui/react/macro'
import { NavLink } from 'react-router'
import styled from 'styled-components/macro'

import { TradeUrlParams } from 'modules/trade/types/TradeRawState'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'
import { SwapAmountDifference } from 'modules/twap/hooks/useSwapAmountDifference'

import { Routes } from 'common/constants/routes'

export type SwapPriceDifferenceWarningProps = {
  swapAmountDifference: SwapAmountDifference
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

const SWAP_PRICE_DIFFERENCE_LIMIT = 0.5 // 0.5%
const FEE_AMOUNT_THRESHOLD = 0.5 // 0.5$

export function SwapPriceDifferenceWarning({
  tradeUrlParams,
  swapAmountDifference,
  feeFiatAmount,
}: SwapPriceDifferenceWarningProps): ReactNode {
  const { amount, percent } = swapAmountDifference
  const isTwapBetter = amount.greaterThan(0)

  const routePath = parameterizeTradeRoute(tradeUrlParams, Routes.SWAP, true)
  const swapOrderLink = (
    <StyledNavLink to={routePath}>
      <Trans>SWAP order</Trans>
    </StyledNavLink>
  )

  return isTwapBetter ? (
    +percent.toSignificant(2) > SWAP_PRICE_DIFFERENCE_LIMIT ? (
      <InlineBanner bannerType={StatusColorVariant.Savings}>
        <strong><Trans>Maximizing Your Gains!</Trans></strong>
        <p>
          <Trans>
            You could gain an extra{' '}
            <b>
              <TokenAmount amount={amount} tokenSymbol={amount.currency} />
            </b>{' '}
            compared to using a {swapOrderLink}
          </Trans>
        </p>
      </InlineBanner>
    ) : null
  ) : feeFiatAmount && +feeFiatAmount.toSignificant(2) > FEE_AMOUNT_THRESHOLD ? (
    <InlineBanner bannerType={StatusColorVariant.Savings}>
      <strong>
        <Trans>Trade Smart, Save More!</Trans>
      </strong>
      <p>
        <Trans>
          Considering current network costs (
          <b>
            <FiatAmount amount={feeFiatAmount} />
          </b>{' '}
          per chunk), you could save more by reducing the number of parts or switch to a {swapOrderLink}.
        </Trans>
      </p>
    </InlineBanner>
  ) : null
}
