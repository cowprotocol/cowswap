import { AppData, AppDataHash, EnrichedOrder, PriceQuality, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

type GpPriceStrategy = 'COWSWAP' | 'LEGACY'

interface PriceInformation {
  token: string
  amount: string | null
  quoteId?: number
}

export interface FeeInformation {
  expirationDate: string
  amount: string
}

interface FeeQuoteParams extends Pick<EnrichedOrder, 'sellToken' | 'buyToken' | 'kind'> {
  amount: string
  userAddress?: string | null
  receiver?: string | null
  validFor?: number
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
  appData?: AppData
  appDataHash?: AppDataHash
}

export type LegacyPriceQuoteParams = Omit<LegacyFeeQuoteParams, 'isEthFlow' | 'sellToken' | 'buyToken'> & {
  baseToken: string
  quoteToken: string
}

export type LegacyPriceSource = 'gnosis-protocol' | 'paraswap' | 'matcha-0x' | '1inch'
export type LegacyPriceInformationWithSource = PriceInformation & { source: LegacyPriceSource; data?: any }
export type LegacyPromiseRejectedResultWithSource = PromiseRejectedResult & { source: LegacyPriceSource }
