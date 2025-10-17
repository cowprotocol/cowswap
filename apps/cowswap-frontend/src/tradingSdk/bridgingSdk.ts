import { bungeeAffiliateCode } from '@cowprotocol/common-const'
import { isBarn, isDev, isProd, isProdLike, isStaging } from '@cowprotocol/common-utils'
import {
  AcrossBridgeProvider,
  BridgeProvider,
  BridgeQuoteResult,
  BridgingSdk,
  BungeeBridgeProvider,
} from '@cowprotocol/sdk-bridging'

import { orderBookApi } from 'cowSdk'

import { tradingSdk } from './tradingSdk'

const bungeeApiBase = getBungeeApiBase()

const bungeeBridgeProvider = new BungeeBridgeProvider({
  apiOptions: {
    includeBridges: ['across', 'cctp', 'gnosis-native-bridge'],
    apiBaseUrl: bungeeApiBase ? `${bungeeApiBase}/api/v1/bungee` : undefined,
    manualApiBaseUrl: bungeeApiBase ? `${bungeeApiBase}/api/v1/bungee-manual` : undefined,
    affiliate: bungeeApiBase ? bungeeAffiliateCode : undefined,
  },
})

const acrossBridgeProvider = new AcrossBridgeProvider()
export const bridgeProviders: BridgeProvider<BridgeQuoteResult>[] = [bungeeBridgeProvider]

// TODO: Should not enable Across on Prod until it's finalized
!isProdLike && bridgeProviders.push(acrossBridgeProvider)

export const bridgingSdk = new BridgingSdk({
  providers: bridgeProviders,
  enableLogging: false,
  tradingSdk,
  orderBookApi,
})

function getBungeeApiBase(): string | undefined {
  if (isProd || isDev || isStaging || isBarn) {
    return 'https://backend.bungee.exchange'
  }

  return 'https://bff.barn.cow.fi/proxies/socket'
}
