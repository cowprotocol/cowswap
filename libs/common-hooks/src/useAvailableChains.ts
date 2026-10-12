import { useMemo } from 'react'

import { getAvailableSourceChains } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useFeatureFlags } from './useFeatureFlags'

/**
 * Hook to get a list of SupportedChainId currently available/enabled
 *
 * Normally it is the exact same list of chains in the SupportChainId enum.
 * It'll be different when a chain is behind a feature flag.
 * Set the flag in this hook.
 *
 * @param areAlphaNetworksEnabled the user's opt-in to alpha networks (CoW Swap's swap settings), on top of their flags
 */
export function useAvailableChains(areAlphaNetworksEnabled = true): SupportedChainId[] {
  // 1. Load feature flag for chain being enabled
  const { isSolanaEnabled } = useFeatureFlags()

  return useMemo(
    // 2. Conditionally build a list of chain ids to exclude
    // () => getAvailableChains(isBaseEnabled ? undefined : [SupportedChainId.BASE]),  <-- example usage, kept for reference
    () => {
      const chainsToSkip: SupportedChainId[] = []

      if (!isSolanaEnabled || !areAlphaNetworksEnabled) {
        chainsToSkip.push(SupportedChainId.SOLANA)
      }

      return getAvailableSourceChains(chainsToSkip)
    },
    [isSolanaEnabled, areAlphaNetworksEnabled],
  )
}
