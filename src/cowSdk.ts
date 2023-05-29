import { MetadataApi } from '@cowprotocol/app-data'
import { OrderBookApi } from '@cowprotocol/cow-sdk'

import { isBarn, isDev, isLocal, isPr } from 'legacy/utils/environments'

export const metadataApiSDK = new MetadataApi()
export const orderBookApi = new OrderBookApi({ env: isLocal || isDev || isPr || isBarn ? 'staging' : 'prod' })
