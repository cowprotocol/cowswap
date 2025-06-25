import { getRpcProvider } from '@cowprotocol/common-const'
import { AcrossBridgeProvider, BungeeBridgeProvider, OrderBookApi } from '@cowprotocol/cow-sdk'

export const orderBookApi = new OrderBookApi()

export const bungeeBridgeProvider = new BungeeBridgeProvider({
  apiOptions: {
    includeBridges: ['across', 'cctp'],
  },
  getRpcProvider,
})

export const acrossBridgeProvider = new AcrossBridgeProvider({ getRpcProvider })

export const knownBridgeProviders = [bungeeBridgeProvider, acrossBridgeProvider]
