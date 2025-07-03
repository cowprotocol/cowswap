import { MetadataApi } from '@cowprotocol/app-data'
import { DEFAULT_BACKOFF_OPTIONS, OrderBookApi } from '@cowprotocol/cow-sdk'

export const metadataApiSDK = new MetadataApi()
export const orderBookApi = new OrderBookApi({
  env: 'prod', // TODO: this is a temporary hack to force prod env
  backoffOpts: DEFAULT_BACKOFF_OPTIONS,
})
