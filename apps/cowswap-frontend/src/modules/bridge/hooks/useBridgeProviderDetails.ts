import { useMemo } from 'react'

import { BridgeProvider, getBridgeProviderDetails } from '../constants/bridgeProviders'
import { BridgeProtocolConfig } from '../types'

/**
 * Hook to retrieve bridge provider details
 *
 * @param provider - The bridge provider
 * @returns Bridge provider details
 */
export function useBridgeProviderDetails(provider: BridgeProvider): BridgeProtocolConfig {
  return useMemo(() => getBridgeProviderDetails(provider), [provider])
}

/**
 * Hook to retrieve all bridge provider details
 *
 * @returns All available bridge provider details mapped by provider
 */
export function useAllBridgeProviderDetails(): Record<BridgeProvider, BridgeProtocolConfig> {
  // This is memoized to ensure consistent references
  return useMemo(() => {
    return Object.values(BridgeProvider).reduce(
      (acc, provider) => {
        const providerEnum = provider as BridgeProvider
        acc[providerEnum] = getBridgeProviderDetails(providerEnum)
        return acc
      },
      {} as Record<BridgeProvider, BridgeProtocolConfig>,
    )
  }, [])
}
