import { FeeInformation, FeeQuoteParams, PriceInformation, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
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

export type LegacyPriceQuoteParams = Omit<LegacyFeeQuoteParams, 'isEthFlow' | 'sellToken' | 'buyToken'> & {
  baseToken: string
  quoteToken: string
}

export type LegacyPriceSource = 'gnosis-protocol' | 'paraswap' | 'matcha-0x' | '1inch'
export type LegacyPriceInformationWithSource = PriceInformation & { source: LegacyPriceSource; data?: any }
export type LegacyPromiseRejectedResultWithSource = PromiseRejectedResult & { source: LegacyPriceSource }
