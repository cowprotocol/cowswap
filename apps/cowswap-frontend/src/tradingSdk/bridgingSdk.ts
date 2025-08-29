import { BridgingSdk, BungeeBridgeProvider } from '@cowprotocol/sdk-bridging'

import { orderBookApi } from 'cowSdk'

import { tradingSdk } from './tradingSdk'

export const bungeeBridgeProvider = new BungeeBridgeProvider({
  apiOptions: {
    includeBridges: ['across', 'cctp', 'gnosis-native-bridge'],
  },
})

export const bridgingSdk = new BridgingSdk({
  providers: [bungeeBridgeProvider],
  enableLogging: false,
  tradingSdk,
  orderBookApi,
})
