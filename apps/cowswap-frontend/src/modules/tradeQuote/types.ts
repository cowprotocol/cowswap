import type { SupportedChainId, AppData, AppDataHash, EnrichedOrder, PriceQuality } from '@cowprotocol/cow-sdk'

export interface FeeQuoteParams extends Pick<EnrichedOrder, 'sellToken' | 'buyToken' | 'kind'> {
  amount: string
  userAddress?: string | null
  receiver?: string | null
  validFor?: number
  fromDecimals?: number
  toDecimals?: number
  chainId: SupportedChainId
  priceQuality: PriceQuality
  isBestQuote?: boolean
  isEthFlow: boolean
  appData?: AppData
  appDataHash?: AppDataHash
}
