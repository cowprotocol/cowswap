import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { DefaultBridgeProvider } from '@cowprotocol/sdk-bridging'
import { useIsSmartContractWallet } from '@cowprotocol/wallet'

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
