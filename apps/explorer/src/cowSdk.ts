import { MetadataApi } from '@cowprotocol/app-data'
import { OrderBookApi, SubgraphApi } from '@cowprotocol/cow-sdk'

import { SUBGRAPH_URLS } from './consts/subgraphUrls'

const prodBaseUrls = process.env.REACT_APP_ORDER_BOOK_URLS
  ? JSON.parse(process.env.REACT_APP_ORDER_BOOK_URLS)
  : undefined

export const orderBookSDK = new OrderBookApi({
  env: 'prod',
  ...(prodBaseUrls ? { baseUrls: prodBaseUrls } : undefined),
})
export const subgraphApiSDK = new SubgraphApi({
  baseUrls: SUBGRAPH_URLS,
})
export const metadataApiSDK = new MetadataApi()
