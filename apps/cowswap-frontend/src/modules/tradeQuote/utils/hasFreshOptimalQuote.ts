import { PriceQuality } from '@cowprotocol/cow-sdk'

import { TradeQuoteState } from '../state/tradeQuoteAtom'

export function hasFreshOptimalQuote(tradeQuote: TradeQuoteState): boolean {
  return Boolean(
    tradeQuote.quote &&
      !tradeQuote.error &&
      tradeQuote.fetchParams?.priceQuality === PriceQuality.OPTIMAL &&
      !tradeQuote.hasParamsChanged,
  )
}
