import { MetadataApi } from '@cowprotocol/cow-sdk'
import { OrderBookApi } from '@cowprotocol/cow-sdk'
import { isBarn, isDev, isLocal, isPr } from 'utils/environments'

export const metadataApiSDK = new MetadataApi()
export const orderBookApi = new OrderBookApi({ env: isLocal || isDev || isPr || isBarn ? 'staging' : 'prod' })
