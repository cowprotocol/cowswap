import { getRpcProvider } from '@cowprotocol/common-const'
import { isBarn, isDev, isProd, isStaging } from '@cowprotocol/common-utils'
import { BridgingSdk, BungeeBridgeProvider } from '@cowprotocol/cow-sdk'

import { orderBookApi } from 'cowSdk'

import { tradingSdk } from './tradingSdk'

export const bungeeBridgeProvider = new BungeeBridgeProvider({
  apiOptions: {
    includeBridges: ['across', 'cctp'],
    apiBaseUrl: `${getBungeeApiBase()}/api/v1/bungee`,
    manualApiBaseUrl: `${getBungeeApiBase()}/api/v1/bungee-manual`,
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
