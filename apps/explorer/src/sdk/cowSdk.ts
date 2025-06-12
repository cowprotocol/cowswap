import { AcrossBridgeProvider, BungeeBridgeProvider, OrderBookApi } from '@cowprotocol/cow-sdk'

export const orderBookApi = new OrderBookApi()

export const bungeeBridgeProvider = new BungeeBridgeProvider({
  apiOptions: {
    includeBridges: ['across', 'cctp'],
  },
})

export const acrossBridgeProvider = new AcrossBridgeProvider()

export const knownBridgeProviders = [bungeeBridgeProvider, acrossBridgeProvider]
