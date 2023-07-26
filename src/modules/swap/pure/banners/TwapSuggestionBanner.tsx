import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { InlineBanner } from 'common/pure/InlineBanner'

export interface TwapSuggestionBannerProps {
  slippage: Percent
  buyingFiatAmount: CurrencyAmount<Currency> | null
}

const TWAP_SUGGESTION_SLIPPAGE_LIMIT = 1 // 1%
const TWAP_SUGGESTION_AMOUNT_LIMIT = 50_000 // $50,000

export function TwapSuggestionBanner({ slippage, buyingFiatAmount }: TwapSuggestionBannerProps) {
  const shouldSuggestTwap =
    +slippage.toFixed(2) > TWAP_SUGGESTION_SLIPPAGE_LIMIT &&
    +(buyingFiatAmount?.toExact() || 0) > TWAP_SUGGESTION_AMOUNT_LIMIT

  if (!shouldSuggestTwap) return null

  return (
    <InlineBanner type="alert">
      Your slippage is {+slippage.toFixed(2)}%. Consider breaking up your order using TWAP orders
    </InlineBanner>
  )
}
