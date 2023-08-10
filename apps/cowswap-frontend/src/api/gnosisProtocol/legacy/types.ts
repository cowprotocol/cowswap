import { SupportedChainId as ChainId, PriceQuality } from '@cowprotocol/cow-sdk'
import { EnrichedOrder } from '@cowprotocol/cow-sdk'

import { FeeInformation, PriceInformation } from 'types'

import { GpPriceStrategy } from 'legacy/state/gas/atoms'

interface FeeQuoteParams extends Pick<EnrichedOrder, 'sellToken' | 'buyToken' | 'kind'> {
  amount: string
  userAddress?: string | null
  receiver?: string | null
  validTo?: number
}

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

export interface LegacyFeeQuoteParams extends FeeQuoteParams {
  fromDecimals?: number
  toDecimals?: number
  chainId: ChainId
  priceQuality: PriceQuality
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
