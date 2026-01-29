import { MetadataApi } from '@cowprotocol/cow-sdk'
import { OrderBookApi } from '@cowprotocol/cow-sdk'
import { SubgraphApi } from '@cowprotocol/sdk-subgraph'

// TODO: why is this duplicated? Can this be shared with the instance from CoW Swap?

const envBaseUrls = process.env.REACT_APP_ORDER_BOOK_URLS && JSON.parse(process.env.REACT_APP_ORDER_BOOK_URLS)
const localStorageBaseUrls =
  localStorage.getItem('orderBookUrls') && JSON.parse(localStorage.getItem('orderBookUrls') || '{}')

const prodBaseUrls = envBaseUrls || localStorageBaseUrls || undefined

const apiKey = process.env.THEGRAPH_API_KEY || ''

export const orderBookSDK = new OrderBookApi({
  env: 'prod',
  ...(prodBaseUrls ? { baseUrls: prodBaseUrls } : undefined),
})

export const subgraphApiSDK = new SubgraphApi(apiKey)

export const metadataApiSDK = new MetadataApi()
