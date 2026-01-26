import { PriceQuality } from '@cowprotocol/cow-sdk'
import { Nullish } from '@cowprotocol/types'

import { TradeQuoteFetchParams } from '../types'

export function getIsFastQuote(fetchParams: Nullish<TradeQuoteFetchParams>): boolean {
  return fetchParams?.priceQuality === PriceQuality.FAST
}
