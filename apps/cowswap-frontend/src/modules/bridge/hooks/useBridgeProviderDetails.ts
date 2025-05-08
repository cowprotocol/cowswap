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
