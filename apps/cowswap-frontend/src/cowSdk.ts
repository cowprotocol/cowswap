import { MetadataApi } from '@cowprotocol/app-data'
import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { OrderBookApi } from '@cowprotocol/cow-sdk'

const prodBaseUrls = process.env.REACT_APP_ORDER_BOOK_URLS
  ? JSON.parse(process.env.REACT_APP_ORDER_BOOK_URLS)
  : undefined

export const metadataApiSDK = new MetadataApi()
export const orderBookApi = new OrderBookApi({
  env: 'staging',
  ...(prodBaseUrls ? { baseUrls: prodBaseUrls } : undefined),
})
