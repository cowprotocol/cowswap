import { RateImpactIndicator } from '@cow/modules/limitOrders/pure/RateImpactIndicator'
import { Currency } from '@uniswap/sdk-core'
import styled from 'styled-components/macro'
import { TokenSymbol } from '@cow/common/pure/TokenSymbol'

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
`

export function HeadingText({ inputCurrency, currency, rateImpact }: Props) {
  if (!currency) {
    return <Wrapper>Select input and output</Wrapper>
  }

  return (
    <Wrapper>
      Price per <TokenSymbol token={currency} />
      {<RateImpactIndicator inputCurrency={inputCurrency} rateImpact={rateImpact} />}
    </Wrapper>
  )
}
