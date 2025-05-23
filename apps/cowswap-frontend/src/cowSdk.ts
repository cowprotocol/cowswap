import { MetadataApi } from '@cowprotocol/app-data'
import { DEFAULT_BACKOFF_OPTIONS, OrderBookApi } from '@cowprotocol/cow-sdk'

const prodBaseUrls = process.env.REACT_APP_ORDER_BOOK_URLS
  ? JSON.parse(process.env.REACT_APP_ORDER_BOOK_URLS)
  : undefined

export const metadataApiSDK = new MetadataApi()
export const orderBookApi = new OrderBookApi({
  env: 'prod', // TODO: this is a temporary hack to force prod env
  ...(prodBaseUrls ? { baseUrls: prodBaseUrls } : undefined),
  backoffOpts: DEFAULT_BACKOFF_OPTIONS,
})
