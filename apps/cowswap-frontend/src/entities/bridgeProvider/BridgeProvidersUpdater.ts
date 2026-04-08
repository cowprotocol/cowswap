import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { DefaultBridgeProvider } from '@cowprotocol/sdk-bridging'
import { useAccountType, useIsSmartContractWallet } from '@cowprotocol/wallet'

import {
  acrossBridgeProvider,
  bridgingSdk,
  bungeeBridgeProvider,
  nearIntentsBridgeProvider,
} from 'tradingSdk/bridgingSdk'

import { bridgeProvidersAtom } from './bridgeProvidersAtom'
import { shouldRestrictStandardBridgeProviders } from './BridgeProvidersUpdater.utils'

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
  const accountType = useAccountType()
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
      const shouldRestrictStandardProviders = shouldRestrictStandardBridgeProviders({
        accountType,
        isSmartContractWallet,
      })

      toggleProvider(newProviders, nearIntentsBridgeProvider, isNearIntentsBridgeProviderEnabled)

      // Only Near intents provider should be available for smart-contract wallets
      // and EIP-7702 accounts until the delegate guarantees EIP-1271 support.
      if (shouldRestrictStandardProviders) {
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
    accountType,
    isSmartContractWallet,
    setBridgeProviders,
  ])

  return null
}
