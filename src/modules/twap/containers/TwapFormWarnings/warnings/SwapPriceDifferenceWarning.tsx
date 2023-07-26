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

const Wrapper = styled.p`
  display: flex;
  gap: 12px;
  text-align: left !important;
`

const EmojiBox = styled.span`
  font-size: 18px;
`

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
    <InlineBanner type={isTwapBetter ? 'success' : 'information'} hideIcon={true}>
      <Wrapper>
        {isTwapBetter && <EmojiBox>🤑</EmojiBox>}
        <div>
          {isTwapBetter ? (
            <>
              You are expected to receive <TokenAmount amount={amount} tokenSymbol={amount.currency} /> more compared to
              the same {swapOrderLink}
            </>
          ) : (
            <>
              Given the current Market Fees (<FiatAmount amount={feeFiatAmount} /> per chunk), it’s better to reduce the
              number of parts or use {swapOrderLink}
            </>
          )}
        </div>
        <div>
          <InfoIcon content="TODO: set the tooltip content"></InfoIcon>
        </div>
      </Wrapper>
    </InlineBanner>
  )
}
