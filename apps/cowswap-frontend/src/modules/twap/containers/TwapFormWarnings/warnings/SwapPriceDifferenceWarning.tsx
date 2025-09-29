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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SwapPriceDifferenceWarning({
  tradeUrlParams,
  swapAmountDifference,
  feeFiatAmount,
}: SwapPriceDifferenceWarningProps) {
  const { amount, percent } = swapAmountDifference
  const isTwapBetter = amount.greaterThan(0)
  const diffLessThanLimit = +percent.toSignificant(2) < SWAP_PRICE_DIFFERENCE_LIMIT

  if (!isTwapBetter && !feeFiatAmount) return null

  if (isTwapBetter && diffLessThanLimit) return null

  const routePath = parameterizeTradeRoute(tradeUrlParams, Routes.SWAP, true)
  const swapOrderLink = (
    <StyledNavLink to={routePath}>
      <Trans>SWAP order</Trans>
    </StyledNavLink>
  )

  return (
    <InlineBanner bannerType={StatusColorVariant.Savings}>
      {isTwapBetter ? (
        <>
          <strong>
            <Trans>Maximizing Your Gains!</Trans>
          </strong>
          <p>
            <Trans>
              You could gain an extra{' '}
              <b>
                <TokenAmount amount={amount} tokenSymbol={amount.currency} />
              </b>{' '}
              compared to using a {swapOrderLink}
            </Trans>
          </p>
        </>
      ) : (
        <>
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
        </>
      )}
    </InlineBanner>
  )
}
