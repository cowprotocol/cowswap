import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { InfoIcon } from 'legacy/components/InfoIcon'

import { FiatAmount } from 'common/pure/FiatAmount'
import { InlineBanner } from 'common/pure/InlineBanner'
import { TokenAmount } from 'common/pure/TokenAmount'

export type SwapPriceDifferenceWarningProps = {
  amount: CurrencyAmount<Currency>
  feeFiatAmount: CurrencyAmount<Token> | null
}

const Wrapper = styled.p`
  display: flex;
  gap: 12px;
  text-align: left !important;
`

const EmojiBox = styled.span`
  font-size: 18px;
`

export function SwapPriceDifferenceWarning({ amount, feeFiatAmount }: SwapPriceDifferenceWarningProps) {
  const isTwapBetter = amount.greaterThan(0)

  if (!isTwapBetter && !feeFiatAmount) return null

  return (
    <InlineBanner type={isTwapBetter ? 'success' : 'information'} hideIcon={true}>
      <Wrapper>
        {isTwapBetter && <EmojiBox>🤑</EmojiBox>}
        <div>
          {isTwapBetter ? (
            <>
              You are expected to receive <TokenAmount amount={amount} tokenSymbol={amount.currency} /> more compared to
              the same SWAP order
            </>
          ) : (
            <>
              Given the current Market Fees (<FiatAmount amount={feeFiatAmount} /> per chunk) , it’s better to reduce
              the number of parts or use SWAP
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
