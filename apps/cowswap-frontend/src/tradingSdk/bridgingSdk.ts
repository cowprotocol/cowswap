import { BungeeBridgeProvider, BridgingSdk } from '@cowprotocol/cow-sdk'

import { orderBookApi } from 'cowSdk'

import { tradingSdk } from './tradingSdk'

export const bungeeBridgeProvider = new BungeeBridgeProvider({})

export const bridgingSdk = new BridgingSdk({
  providers: [bungeeBridgeProvider],
  enableLogging: false,
  tradingSdk,
  orderBookApi,
})
