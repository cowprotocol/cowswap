import { OrderBookApi, SubgraphApi } from '@cowprotocol/cow-sdk'
import { MetadataApi } from '@cowprotocol/app-data'
import { SUBGRAPH_URLS } from './consts/subgraphUrls'

export const orderBookSDK = new OrderBookApi({ env: 'prod' })
export const subgraphApiSDK = new SubgraphApi({
  baseUrls: SUBGRAPH_URLS,
})
export const metadataApiSDK = new MetadataApi()
