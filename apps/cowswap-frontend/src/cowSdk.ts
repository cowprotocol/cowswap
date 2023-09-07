import { MetadataApi } from '@cowprotocol/app-data'
import { OrderBookApi } from '@cowprotocol/cow-sdk'

import { isBarnBackendEnv } from 'legacy/utils/environments'

const prodBaseUrls = process.env.REACT_APP_ORDER_BOOK_URLS
  ? JSON.parse(process.env.REACT_APP_ORDER_BOOK_URLS)
  : undefined

export const metadataApiSDK = new MetadataApi()
export const orderBookApi = new OrderBookApi({
  env: isBarnBackendEnv ? 'staging' : 'prod',
  ...(prodBaseUrls ? { baseUrls: prodBaseUrls } : undefined),
})
