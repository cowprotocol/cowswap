import { MetadataApi } from '@cowprotocol/app-data'
import { OrderBookApi } from '@cowprotocol/cow-sdk'

import { isBarnBackendEnv } from 'legacy/utils/environments'

export const metadataApiSDK = new MetadataApi()
export const orderBookApi = new OrderBookApi({
  env: isBarnBackendEnv ? 'staging' : 'prod',
})
