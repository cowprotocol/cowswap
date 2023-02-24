import { MetadataApi } from '@cowprotocol/cow-sdk/metadata'
import { OrderBookApi } from '@cowprotocol/cow-sdk/order-book'
import { isBarn, isDev, isLocal, isPr } from 'utils/environments'

export const metadataApiSDK = new MetadataApi()
export const orderBookApi = new OrderBookApi(isLocal || isDev || isPr || isBarn ? 'staging' : 'prod')
