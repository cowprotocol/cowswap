import {
  FeeInformation,
  FeeQuoteParams,
  PriceInformation,
  PriceQuoteParams,
  SupportedChainId as ChainId,
} from '@cowprotocol/cow-sdk'
import { GpPriceStrategy } from 'state/gas/atoms'

export interface LegacyQuoteParams {
  quoteParams: LegacyFeeQuoteParams
  strategy: GpPriceStrategy
  fetchFee: boolean
  previousFee?: FeeInformation
  isPriceRefresh: boolean
}

export class LegacyPriceQuoteError extends Error {
  params: LegacyPriceQuoteParams
  results: PromiseSettledResult<any>[]

  constructor(message: string, params: LegacyPriceQuoteParams, results: PromiseSettledResult<any>[]) {
    super(message)
    this.params = params
    this.results = results
  }
}

export type LegacyFeeQuoteParams = FeeQuoteParams & {
  fromDecimals: number
  toDecimals: number
  chainId: ChainId
  priceQuality?: string
  isBestQuote?: boolean
  isEthFlow: boolean
}

export type LegacyPriceQuoteParams = Omit<LegacyFeeQuoteParams, 'isEthFlow' | 'sellToken' | 'buyToken'> &
  PriceQuoteParams

export type LegacyPriceSource = 'gnosis-protocol' | 'paraswap' | 'matcha-0x'
export type LegacyPriceInformationWithSource = PriceInformation & { source: LegacyPriceSource; data?: any }
export type LegacyPromiseRejectedResultWithSource = PromiseRejectedResult & { source: LegacyPriceSource }
