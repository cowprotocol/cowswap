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
        You are expected to receive <TokenAmount amount={amount} tokenSymbol={amount.currency} /> more compared to the
        same SWAP order
      </p>
    </InlineBanner>
  )
}
