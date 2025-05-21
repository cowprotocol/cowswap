import { useMemo } from 'react'

import { BridgeProvider, getBridgeProviderDetails, BridgeProtocolConfig } from '@cowprotocol/bridge'

/**
 * Hook to retrieve bridge provider details
 *
 * @param provider - The bridge provider
 * @returns Bridge provider details
 */
export function useBridgeProviderDetails(provider: BridgeProvider): BridgeProtocolConfig | undefined {
  return useMemo(() => getBridgeProviderDetails(provider), [provider])
}
