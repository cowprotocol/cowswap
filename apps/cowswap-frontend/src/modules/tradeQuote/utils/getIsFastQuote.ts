import { PriceQuality } from '@cowprotocol/cow-sdk'
import { Nullish } from '@cowprotocol/types'

import { TradeQuoteFetchParams } from '../types'

export function getIsFastQuote(fetchParams: Nullish<TradeQuoteFetchParams>): boolean {
  return fetchParams?.priceQuality === PriceQuality.FAST
}

/**
 * The definitive quote we place orders from, as opposed to the `fast` preview quote.
 * Keyed off `fast` rather than a specific price quality so that changing what we request
 * (`optimal` -> `verified`) doesn't silently turn every one of these checks false.
 */
export function getIsFinalQuote(fetchParams: Nullish<TradeQuoteFetchParams>): boolean {
  return !!fetchParams && !getIsFastQuote(fetchParams)
}
