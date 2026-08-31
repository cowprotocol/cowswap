import type { Address } from 'viem'

import { bungeeAffiliateCode } from '@cowprotocol/common-const'
import { isDev, isProd, isStaging } from '@cowprotocol/common-utils'
import {
  AcrossBridgeProvider,
  BridgingSdk,
  BungeeBridgeProvider,
  NearIntentsBridgeProvider,
} from '@cowprotocol/sdk-bridging'

import { orderBookApi } from 'cowSdk'

import { tradingSdk } from './tradingSdk'

const bungeeApiBase = getBungeeApiBase()

const bungeeIncludeBridgesOverride = localStorage.getItem('bungeeIncludeBridges')

export const bungeeBridgeProvider = new BungeeBridgeProvider({
  apiOptions: {
    includeBridges: bungeeIncludeBridgesOverride
      ? JSON.parse(bungeeIncludeBridgesOverride)
      : ['across', 'cctp-v2-fast', 'cctp-v2', 'gnosis-native-bridge'],
    apiBaseUrl: bungeeApiBase ? `${bungeeApiBase}/api/v1/bungee` : undefined,
    manualApiBaseUrl: bungeeApiBase ? `${bungeeApiBase}/api/v1/bungee-manual` : undefined,
    affiliate: bungeeApiBase ? bungeeAffiliateCode : undefined,
  },
})

export const acrossBridgeProvider = new AcrossBridgeProvider()

export const nearIntentsBridgeProvider = new NearIntentsBridgeProvider({ apiKey: process.env.REACT_APP_NEAR_API_KEY })

// `ATTESTATOR_ADDRESS` in `@cowprotocol/sdk-bridging`, not exported — duplicated here since the
// e2e bypass below needs to match it exactly.
const NEAR_INTENTS_E2E_ATTESTATOR_ADDRESS: Address = '0x0073DD100b51C555E41B2a452E5933ef76F42790'

// e2e tests mock Near Intents' quote/attestation endpoints with a captured response pair that
// isn't (and can't practically be) signed by Near's real attestor key — `recoverDepositAddress`
// is a live digital-signature check, not something a mocked pair can satisfy, so it's patched out
// entirely for e2e rather than trying to forge a valid signature. See
// `apps/cowswap-e2e-tests/src/mocks/nearIntents.ts`.
// The `NODE_ENV !== 'production'` check is load-bearing, not redundant with the `window` flag below:
// every deployed build (prod, staging, and Vercel preview) runs through the production webpack build
// (`NODE_ENV === 'production'`), so this whole branch — including the bypass itself — is dead code
// there and gets stripped by Terser. Only the local/CI dev server that e2e tests run against
// (`NODE_ENV === 'development'`) evaluates it, so a real deployed bundle has no live code path that
// can disable this signature check, no matter what `window.__COWSWAP_E2E__` is set to.
if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined' && window.__COWSWAP_E2E__) {
  nearIntentsBridgeProvider.recoverDepositAddress = async ({ quote }) => ({
    address: NEAR_INTENTS_E2E_ATTESTATOR_ADDRESS,
    quoteHash: quote.depositAddress ?? '0x0',
    stringifiedQuote: '',
    attestationSignature: '0x',
  })
}

export const bridgingSdk = new BridgingSdk({
  providers: [bungeeBridgeProvider, acrossBridgeProvider, nearIntentsBridgeProvider],
  enableLogging: !!localStorage.getItem('enableBridgingSdkLogs'),
  tradingSdk,
  orderBookApi,
})

// Enable only Bungee by default
bridgingSdk.setAvailableProviders([bungeeBridgeProvider.info.dappId])

function getBungeeApiBase(): string | undefined {
  if (isProd || isDev || isStaging) {
    return 'https://backend.bungee.exchange'
  }

  return 'https://bff.barn.cow.fi/proxies/socket'
}
