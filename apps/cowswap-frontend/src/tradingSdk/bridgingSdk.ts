import { getRpcProvider } from '@cowprotocol/common-const'
import { isBarn, isDev, isProd, isStaging } from '@cowprotocol/common-utils'
import { BridgingSdk, BungeeBridgeProvider } from '@cowprotocol/cow-sdk'

import { orderBookApi } from 'cowSdk'

import { tradingSdk } from './tradingSdk'

const bungeeApiBase = getBungeeApiBase()

const bungeeAffiliateCode =
  '609913096e1a3d62cecd0ffff47aa3e459eaedceb5fef75aad43e6cbff367039708902197e0b2b78b1d76cb0837ad0b318baedceb5fef75aad43e6cb'

export const bungeeBridgeProvider = new BungeeBridgeProvider({
  apiOptions: {
    includeBridges: ['across', 'cctp', 'gnosis-native-bridge'],
    apiBaseUrl: bungeeApiBase ? `${bungeeApiBase}/api/v1/bungee` : undefined,
    manualApiBaseUrl: bungeeApiBase ? `${bungeeApiBase}/api/v1/bungee-manual` : undefined,
    affiliate: bungeeApiBase ? bungeeAffiliateCode : undefined,
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
  if (isProd || isDev || isStaging || isBarn) {
    return 'https://backend.bungee.exchange'
  }

  return undefined
}
