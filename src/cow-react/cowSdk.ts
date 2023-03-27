import { MetadataApi } from '@cowprotocol/app-data'
import { OrderBookApi, OrderSignApi } from '@cowprotocol/cow-sdk'
import { isBarn, isDev, isLocal, isPr } from 'utils/environments'

export const metadataApiSDK = new MetadataApi()
export const orderBookApi = new OrderBookApi({ env: isLocal || isDev || isPr || isBarn ? 'staging' : 'prod' })
export const orderSignApi = new OrderSignApi()
