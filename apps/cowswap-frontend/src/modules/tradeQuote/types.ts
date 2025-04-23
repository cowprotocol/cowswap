import { PriceQuality } from '@cowprotocol/cow-sdk'

export interface TradeQuoteFetchParams {
  hasParamsChanged: boolean
  priceQuality: PriceQuality
  fetchStartTimestamp: number
}
