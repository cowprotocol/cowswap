import { useMemo } from 'react'

import { getAvailableChains } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useFeatureFlags } from './useFeatureFlags'
/**
 * Hook to get a list of SupportedChainId currently available/enabled
 *
 * Normally it is the exact same list of chains in the SupportChainId enum.
 * It'll be different when a chain is behind a feature flag.
 * Set the flag in this hook.
 */
export function useAvailableChains(): SupportedChainId[] {
  // 1. Load feature flag for chain being enabled
  const { isAvalancheEnabled, isPolygonEnabled } = useFeatureFlags()

  return useMemo(
    // 2. Conditionally build a list of chain ids to exclude
    // () => getAvailableChains(isBaseEnabled ? undefined : [SupportedChainId.BASE]),  <-- example usage, kept for reference
    () => {
      const chainsToSkip: SupportedChainId[] = []

      if (!isAvalancheEnabled) {
        chainsToSkip.push(SupportedChainId.AVALANCHE)
      }

      if (!isPolygonEnabled) {
        chainsToSkip.push(SupportedChainId.POLYGON)
      }

      return getAvailableChains(chainsToSkip)
    },
    [isAvalancheEnabled, isPolygonEnabled],
  )
}
