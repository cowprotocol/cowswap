import { PriceQuality } from '@cowprotocol/cow-sdk'

export interface TradeQuoteFetchParams {
  hasParamsChanged: boolean
  priceQuality: PriceQuality
  fetchStartTimestamp: number
}

export interface TradeQuotePollingParameters {
  isConfirmOpen: boolean
  isQuoteUpdatePossible: boolean
  useSuggestedSlippageApi: boolean
}
