import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { InlineBanner } from 'common/pure/InlineBanner'
import { TokenAmount } from 'common/pure/TokenAmount'

export type SwapPriceDifferenceWarningProps = {
  amount: CurrencyAmount<Currency>
}

export function SwapPriceDifferenceWarning({ amount }: SwapPriceDifferenceWarningProps) {
  return (
    <InlineBanner type="success">
      <p>
        You could gain an extra <TokenAmount amount={amount} tokenSymbol={amount.currency} /> compared to using SWAP. Every bit counts!
      </p>
    </InlineBanner>
  )
}
