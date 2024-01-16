import { UI } from '@cowprotocol/ui'
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
  opacity: 0.7;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }
`

export function HeadingText({ inputCurrency, currency, rateImpact }: Props) {
  if (!currency) {
    return <Wrapper>Select input and output</Wrapper>
  }

  return (
    <Wrapper>
      {/* Price of <TokenSymbol token={currency} /> */}
      Limit price
      {<RateImpactIndicator inputCurrency={inputCurrency} rateImpact={rateImpact} />}
    </Wrapper>
  )
}
