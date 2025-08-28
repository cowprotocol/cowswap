import { getRpcProvider } from '@cowprotocol/common-const'
import { isLocal } from '@cowprotocol/common-utils'
import { AcrossBridgeProvider, BungeeBridgeProvider, OrderBookApi } from '@cowprotocol/cow-sdk'

export const orderBookApi = new OrderBookApi()

const bungeeAffiliateCode =
  '609913096e1a3d62cecd0ffff47aa3e459eaedceb5fef75aad43e6cbff367039708902197e0b2b78b1d76cb0837ad0b318baedceb5fef75aad43e6cb'

export const bungeeBridgeProvider = new BungeeBridgeProvider({
  apiOptions: {
    includeBridges: ['across', 'cctp', 'gnosis-native-bridge'],
    affiliate: isLocal ? undefined : bungeeAffiliateCode,
  },
  getRpcProvider,
})

export const acrossBridgeProvider = new AcrossBridgeProvider({ getRpcProvider })

export const knownBridgeProviders = [bungeeBridgeProvider, acrossBridgeProvider]
