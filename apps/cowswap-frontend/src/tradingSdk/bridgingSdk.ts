import { getRpcProvider } from '@cowprotocol/common-const'
import { isLocal } from '@cowprotocol/common-utils'
import { BridgingSdk, BungeeBridgeProvider } from '@cowprotocol/cow-sdk'

import { orderBookApi } from 'cowSdk'

import { tradingSdk } from './tradingSdk'

const bungeeApiBase = getBungeeApiBase()

export const bungeeBridgeProvider = new BungeeBridgeProvider({
  apiOptions: {
    includeBridges: ['across', 'cctp', 'gnosis-native-bridge'],
    apiBaseUrl: bungeeApiBase ? `${bungeeApiBase}/api/v1/bungee` : undefined,
    manualApiBaseUrl: bungeeApiBase ? `${bungeeApiBase}/api/v1/bungee-manual` : undefined,
  },
  getRpcProvider,
})

export const bridgingSdk = new BridgingSdk({
  providers: [bungeeBridgeProvider],
  enableLogging: false,
  tradingSdk,
  orderBookApi,
})

// returns private endpoint if not local, otherwise undefined
function getBungeeApiBase(): string | undefined {
  return isLocal ? undefined : 'https://backend.bungee.exchange'
}
