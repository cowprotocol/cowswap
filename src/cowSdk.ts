import { MetadataApi } from '@cowprotocol/app-data'
import { OrderBookApi } from '@cowprotocol/cow-sdk'

import { isBarn, isDev, isLocal, isPr } from 'legacy/utils/environments'

// TODO: find a solution for an issue with environment problem with TWAP
const isTwapTesting = true

export const metadataApiSDK = new MetadataApi()
export const orderBookApi = new OrderBookApi({
  env: !isTwapTesting && (isLocal || isDev || isPr || isBarn) ? 'staging' : 'prod',
})
