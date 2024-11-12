import { AppData, AppDataHash, EnrichedOrder, PriceQuality, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

interface FeeQuoteParams extends Pick<EnrichedOrder, 'sellToken' | 'buyToken' | 'kind'> {
  amount: string
  userAddress?: string | null
  receiver?: string | null
  validFor?: number
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
