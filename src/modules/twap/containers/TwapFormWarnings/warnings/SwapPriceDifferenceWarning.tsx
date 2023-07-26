import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { InlineBanner } from 'common/pure/InlineBanner'
import { TokenAmount } from 'common/pure/TokenAmount'

import { InfoIcon } from '../../../../../legacy/components/InfoIcon'

export type SwapPriceDifferenceWarningProps = {
  amount: CurrencyAmount<Currency>
}

const Wrapper = styled.p`
  display: flex;
  gap: 12px;
  text-align: left !important;
`

const EmojiBox = styled.span`
  font-size: 18px;
`

export function SwapPriceDifferenceWarning({ amount }: SwapPriceDifferenceWarningProps) {
  return (
    <InlineBanner type="success" hideIcon={true}>
      <Wrapper>
        <EmojiBox>🤑</EmojiBox>
        <div>
          You are expected to receive <TokenAmount amount={amount} tokenSymbol={amount.currency} /> more compared to the
          same SWAP order
        </div>
        <div>
          <InfoIcon content="TODO: set the tooltip content"></InfoIcon>
        </div>
      </Wrapper>
    </InlineBanner>
  )
}
