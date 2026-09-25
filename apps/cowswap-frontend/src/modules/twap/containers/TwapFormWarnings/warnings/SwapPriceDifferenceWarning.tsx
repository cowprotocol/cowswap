import { ReactNode } from 'react'

import { FEE_SIZE_THRESHOLD } from '@cowprotocol/common-const'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { FiatAmount, InlineBanner, StatusColorVariant, TokenAmount } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { NavLink } from 'react-router'
import styled from 'styled-components/macro'

import { SwapAmountDifference } from 'modules/twap/hooks/useSwapAmountDifference'

import { Routes } from 'common/constants/routes'
import { parameterizeTradeRoute, TradeUrlParams } from 'common/modules/tradeNavigation'

import { TwapSwapSuggestion } from '../../../utils/getTwapSwapSuggestion'

export type SwapPriceDifferenceWarningProps = {
  swapAmountDifference: SwapAmountDifference | null
  suggestion: TwapSwapSuggestion | null
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

export function SwapPriceDifferenceWarning({
  tradeUrlParams,
  swapAmountDifference,
  suggestion,
  feeFiatAmount,
}: SwapPriceDifferenceWarningProps): ReactNode {
  const routePath = parameterizeTradeRoute(tradeUrlParams, Routes.SWAP, true)
  const swapOrderLink = (
    <StyledNavLink to={routePath}>
      <Trans>SWAP order</Trans>
    </StyledNavLink>
  )

  if (suggestion) {
    return (
      <InlineBanner bannerType={StatusColorVariant.Savings}>
        <strong>
          <Trans>Trade Smart, Save More!</Trans>
        </strong>
        <p>
          <SwapSuggestionCopy suggestion={suggestion} feeFiatAmount={feeFiatAmount} swapOrderLink={swapOrderLink} />
        </p>
      </InlineBanner>
    )
  }

  if (!swapAmountDifference) return null

  const { amount, percent } = swapAmountDifference
  const isTwapBetter = amount.greaterThan(0)

  if (!isTwapBetter || +percent.toSignificant(2) <= SWAP_PRICE_DIFFERENCE_LIMIT) return null

  return (
    <InlineBanner bannerType={StatusColorVariant.Savings}>
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
    </InlineBanner>
  )
}

function SwapSuggestionCopy({
  suggestion,
  feeFiatAmount,
  swapOrderLink,
}: {
  suggestion: TwapSwapSuggestion
  feeFiatAmount: CurrencyAmount<Token> | null
  swapOrderLink: ReactNode
}): ReactNode {
  if (suggestion.kind === 'reduce-parts') {
    const { maxParts } = suggestion

    return feeFiatAmount ? (
      <Trans>
        Considering current network costs (
        <b>
          <FiatAmount amount={feeFiatAmount} />
        </b>{' '}
        per part), you can get under the {FEE_SIZE_THRESHOLD}% cost threshold by reducing to {maxParts} or fewer parts,
        or switch to a {swapOrderLink}.
      </Trans>
    ) : (
      <Trans>
        You can get under the {FEE_SIZE_THRESHOLD}% cost threshold by reducing to {maxParts} or fewer parts, or switch
        to a {swapOrderLink}.
      </Trans>
    )
  }

  return feeFiatAmount ? (
    <Trans>
      Considering current network costs (
      <b>
        <FiatAmount amount={feeFiatAmount} />
      </b>{' '}
      per part), switch to a {swapOrderLink}.
    </Trans>
  ) : (
    <Trans>Switch to a {swapOrderLink}.</Trans>
  )
}
