import { MetadataApi } from '@cowprotocol/cow-sdk'
import { OrderBookApi } from '@cowprotocol/cow-sdk'
import { SubgraphApi } from '@cowprotocol/sdk-subgraph'

const prodBaseUrls = process.env.REACT_APP_ORDER_BOOK_URLS
  ? JSON.parse(process.env.REACT_APP_ORDER_BOOK_URLS)
  : undefined

const apiKey = process.env.THEGRAPH_API_KEY || ''

export const orderBookSDK = new OrderBookApi({
  env: 'prod',
  ...(prodBaseUrls ? { baseUrls: prodBaseUrls } : undefined),
})

export const subgraphApiSDK = new SubgraphApi(apiKey)

export const metadataApiSDK = new MetadataApi()
