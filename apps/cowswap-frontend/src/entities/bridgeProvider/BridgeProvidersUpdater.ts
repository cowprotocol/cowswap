import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { DefaultBridgeProvider } from '@cowprotocol/sdk-bridging'
import { useIsCoinbaseWallet, useIsSmartContractWallet } from '@cowprotocol/wallet'

import {
  acrossBridgeProvider,
  bridgingSdk,
  bungeeBridgeProvider,
  nearIntentsBridgeProvider,
} from 'tradingSdk/bridgingSdk'

import { bridgeProvidersAtom } from './bridgeProvidersAtom'

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
  const isCoinbaseWallet = useIsCoinbaseWallet()

  useEffect(() => {
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

      // Coinbase SCW had full bridge access production (was treated as EOA).
      // Other SCWs (Safe, unknown) were already Near-only. Preserve both behaviors.
      // IMPORTANT: both branches must toggle — state persists across wallet transitions
      // (new Set(providers)), so an else is required to re-enable after a Safe/SCW session.
      if (isSmartContractWallet && !isCoinbaseWallet) {
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
    isCoinbaseWallet,
    setBridgeProviders,
  ])

  return null
}
