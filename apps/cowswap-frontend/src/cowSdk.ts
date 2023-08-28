import { MetadataApi } from '@cowprotocol/app-data'
import { OrderBookApi, SupportedChainId } from '@cowprotocol/cow-sdk'

import { isBarnBackendEnv } from 'legacy/utils/environments'

export const metadataApiSDK = new MetadataApi()
export const orderBookApi = new OrderBookApi({
  env: isBarnBackendEnv ? 'staging' : 'prod',
  baseUrls: {
    [SupportedChainId.MAINNET]: 'https://YOUR_HOST/mainnet',
    [SupportedChainId.GNOSIS_CHAIN]: 'https://api.cow.fi/xdai',
    [SupportedChainId.GOERLI]: 'https://api.cow.fi/goerli',
  },
})
