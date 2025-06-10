import { BridgingSdk, BungeeBridgeProvider } from '@cowprotocol/cow-sdk'

import { orderBookApi } from 'cowSdk'

import { tradingSdk } from './tradingSdk'

export const bungeeBridgeProvider = new BungeeBridgeProvider({
  apiOptions: {
    includeBridges: ['across', 'cctp'],
  },
})

export const bridgingSdk = new BridgingSdk({
  providers: [bungeeBridgeProvider],
  enableLogging: false,
  tradingSdk,
  orderBookApi,
})
