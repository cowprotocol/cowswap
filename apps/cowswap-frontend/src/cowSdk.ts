import { MetadataApi } from '@cowprotocol/app-data'
import { ORDER_BOOK_PROD_CONFIG, ORDER_BOOK_STAGING_CONFIG, OrderBookApi } from '@cowprotocol/cow-sdk'

import { isBarnBackendEnv } from 'legacy/utils/environments'

const prodBaseUrls = process.env.REACT_APP_ORDER_BOOK_URLS
  ? JSON.parse(process.env.REACT_APP_ORDER_BOOK_URLS)
  : isBarnBackendEnv
  ? ORDER_BOOK_STAGING_CONFIG
  : ORDER_BOOK_PROD_CONFIG

export const metadataApiSDK = new MetadataApi()
export const orderBookApi = new OrderBookApi({
  env: isBarnBackendEnv ? 'staging' : 'prod',
  baseUrls: prodBaseUrls,
})
