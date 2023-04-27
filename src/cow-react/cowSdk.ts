import { MetadataApi } from '@cowprotocol/app-data'
import { OrderBookApi, SupportedChainId, ApiBaseUrls, ORDER_BOOK_PROD_CONFIG } from '@cowprotocol/cow-sdk'
import { isBarn, isDev, isLocal, isPr } from 'utils/environments'

const ORDER_BOOK_DEV_CONFIG: ApiBaseUrls = {
  [SupportedChainId.MAINNET]: 'https://dev.cow.fi/mainnet',
  [SupportedChainId.GNOSIS_CHAIN]: 'https://dev.cow.fi/xdai',
  [SupportedChainId.GOERLI]: 'https://dev.cow.fi/goerli',
}

const isNotProd = isLocal || isDev || isPr || isBarn

export const metadataApiSDK = new MetadataApi()
export const orderBookApi = new OrderBookApi({
  env: isNotProd ? 'staging' : 'prod',
  baseUrls: isNotProd ? ORDER_BOOK_DEV_CONFIG : ORDER_BOOK_PROD_CONFIG,
})
