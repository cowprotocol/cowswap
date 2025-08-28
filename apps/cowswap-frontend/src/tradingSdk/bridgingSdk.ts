import { getRpcProvider } from '@cowprotocol/common-const'
import { isLocal } from '@cowprotocol/common-utils'
import { BridgingSdk, BungeeBridgeProvider } from '@cowprotocol/cow-sdk'

import { orderBookApi } from 'cowSdk'

import { tradingSdk } from './tradingSdk'

const bungeeApiBase = getBungeeApiBase()

const bungeeAffiliateCode =
  '609913096e1a3d62cecd0ffff47aa3e459eaedceb5fef75aad43e6cbff367039708902197e0b2b78b1d76cb0837ad0b318baedceb5fef75aad43e6cb'

export const bungeeBridgeProvider = new BungeeBridgeProvider({
  apiOptions: {
    includeBridges: ['across', 'cctp', 'gnosis-native-bridge'],
    // if undefined, the sdk will default to the public api that allows custom headers
    apiBaseUrl: bungeeApiBase ? `${bungeeApiBase}/api/v1/bungee` : undefined,
    // if undefined, the sdk will default to the public api that allows custom headers
    manualApiBaseUrl: bungeeApiBase ? `${bungeeApiBase}/api/v1/bungee-manual` : undefined,
    affiliate: bungeeApiBase ? undefined : bungeeAffiliateCode,
  },
  getRpcProvider,
})

export const bridgingSdk = new BridgingSdk({
  providers: [bungeeBridgeProvider],
  enableLogging: false,
  tradingSdk,
  orderBookApi,
})

function getBungeeApiBase(): string | undefined {
  return isLocal ? 'https://backend.bungee.exchange' : undefined
}
