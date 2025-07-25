import { MetadataApi } from '@cowprotocol/app-data'
import { OrderBookApi, SubgraphApi } from '@cowprotocol/cow-sdk'

import { SUBGRAPH_URLS } from './consts/subgraphUrls'

// TODO: why is this duplicated? Can this be shared with the instance from CoW Swap?

const envBaseUrls = process.env.REACT_APP_ORDER_BOOK_URLS && JSON.parse(process.env.REACT_APP_ORDER_BOOK_URLS)
const localStorageBaseUrls =
  localStorage.getItem('orderBookUrls') && JSON.parse(localStorage.getItem('orderBookUrls') || '{}')

const prodBaseUrls = envBaseUrls || localStorageBaseUrls || undefined

export const orderBookSDK = new OrderBookApi({
  env: 'prod',
  ...(prodBaseUrls ? { baseUrls: prodBaseUrls } : undefined),
})
export const subgraphApiSDK = new SubgraphApi({
  baseUrls: SUBGRAPH_URLS,
})
export const metadataApiSDK = new MetadataApi()
