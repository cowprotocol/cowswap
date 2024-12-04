import { TokenLogo } from '@cowprotocol/tokens'
import { TokenSymbol, UI } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { RateImpactIndicator } from 'modules/limitOrders/pure/RateImpactIndicator'

type Props = {
  currency: Currency | null
  inputCurrency: Currency | null
  rateImpact: number
}

const Wrapper = styled.span`
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: flex-start;
  text-align: left;
  gap: 0 3px;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
`

const TokenWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: bold;
`

export function HeadingText({ inputCurrency, currency, rateImpact }: Props) {
  if (!currency) {
    return <Wrapper>Select input and output</Wrapper>
  }

  return (
    <Wrapper>
      When 1
      <TokenWrapper>
        <TokenLogo token={currency} size={16} />
        <TokenSymbol token={currency} />
      </TokenWrapper>
      is worth
      {<RateImpactIndicator inputCurrency={inputCurrency} rateImpact={rateImpact} />}
    </Wrapper>
  )
}
