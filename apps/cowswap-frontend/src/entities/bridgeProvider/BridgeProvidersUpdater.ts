import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isBarn, isDev, isLocal, isPr } from '@cowprotocol/common-utils'
import { DefaultBridgeProvider } from '@cowprotocol/sdk-bridging'
import { useIsSmartContractWallet } from '@cowprotocol/wallet'

import {
  acrossBridgeProvider,
  bridgingSdk,
  bungeeBridgeProvider,
  nearIntentsBridgeProvider,
} from 'tradingSdk/bridgingSdk'

import { bridgeProvidersAtom } from './bridgeProvidersAtom'

/**
 * Dev-only (`isLocal` | `isDev` | `isPr` | `isBarn`): key `cowswap_debug_bridge_providers`
 * - `across-only` — `localStorage.setItem('cowswap_debug_bridge_providers', 'across-only')`
 * - `bungee-only` — `localStorage.setItem('cowswap_debug_bridge_providers', 'bungee-only')`
 * Remove with `localStorage.removeItem('cowswap_debug_bridge_providers')` then reload.
 * Note: `isDev` is hostname-based (e.g. dev.swap.cow.fi), not NODE_ENV — localhost is `isLocal` only.
 */
const DEBUG_BRIDGE_PROVIDERS_KEY = 'cowswap_debug_bridge_providers'

function isBridgeDebugLocalStorageAllowed(): boolean {
  return isLocal || isDev || isPr || isBarn
}

function toggleProvider(providers: Set<DefaultBridgeProvider>, provider: DefaultBridgeProvider, flag: boolean): void {
  if (flag) {
    providers.add(provider)
  } else {
    providers.delete(provider)
  }
}

export function BridgeProvidersUpdater(): null {
  const setBridgeProviders = useSetAtom(bridgeProvidersAtom)
  const { isNearIntentsBridgeProviderEnabled, isAcrossBridgeProviderEnabled, isBungeeBridgeProviderEnabled } =
    useFeatureFlags()
  const isSmartContractWallet = useIsSmartContractWallet()

  useEffect(() => {
    const debugBridgeProviders =
      typeof window !== 'undefined' && isBridgeDebugLocalStorageAllowed()
        ? window.localStorage.getItem(DEBUG_BRIDGE_PROVIDERS_KEY)
        : null

    if (debugBridgeProviders === 'across-only') {
      const next = new Set<DefaultBridgeProvider>([acrossBridgeProvider])
      setBridgeProviders(next)
      bridgingSdk.setAvailableProviders([acrossBridgeProvider.info.dappId])
      console.info(
        '[cowswap:bridge-debug] Forced Across-only providers (localStorage cowswap_debug_bridge_providers=across-only). Smart contract wallet:',
        isSmartContractWallet,
      )
      return
    }

    if (debugBridgeProviders === 'bungee-only') {
      const next = new Set<DefaultBridgeProvider>([bungeeBridgeProvider])
      setBridgeProviders(next)
      bridgingSdk.setAvailableProviders([bungeeBridgeProvider.info.dappId])
      console.info(
        '[cowswap:bridge-debug] Forced Bungee-only providers (localStorage cowswap_debug_bridge_providers=bungee-only). Smart contract wallet:',
        isSmartContractWallet,
      )
      return
    }

    // Skip updating till all flags are loaded
    if (
      [isNearIntentsBridgeProviderEnabled, isAcrossBridgeProviderEnabled, isBungeeBridgeProviderEnabled].some(
        (v) => typeof v !== 'boolean',
      )
    ) {
      return
    }

    setBridgeProviders((providers) => {
      const newProviders = new Set(providers)

      toggleProvider(newProviders, nearIntentsBridgeProvider, isNearIntentsBridgeProviderEnabled)

      // Only Near intents provider should be available for smart-contract wallets
      if (isSmartContractWallet) {
        toggleProvider(newProviders, bungeeBridgeProvider, false)
        toggleProvider(newProviders, acrossBridgeProvider, false)
      } else {
        toggleProvider(newProviders, bungeeBridgeProvider, isBungeeBridgeProviderEnabled)
        toggleProvider(newProviders, acrossBridgeProvider, isAcrossBridgeProviderEnabled)
      }

      bridgingSdk.setAvailableProviders([...newProviders].map((p) => p.info.dappId))

      return newProviders
    })
  }, [
    isNearIntentsBridgeProviderEnabled,
    isAcrossBridgeProviderEnabled,
    isBungeeBridgeProviderEnabled,
    isSmartContractWallet,
    setBridgeProviders,
  ])

  return null
}
