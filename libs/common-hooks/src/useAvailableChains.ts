import { useMemo } from 'react'

import { getAvailableSourceChains } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getIsSolanaAvailable, useFeatureFlags } from './useFeatureFlags'

export interface UseAvailableChainsOptions {
  /** Excludes Solana regardless of the feature flag. Defaults to `false` */
  excludeSolana?: boolean
}

/**
 * Hook to get a list of SupportedChainId currently available/enabled
 *
 * Normally it is the exact same list of chains in the SupportChainId enum.
 * It'll be different when a chain is behind a feature flag.
 * Set the flag in this hook.
 */
export function useAvailableChains({ excludeSolana = false }: UseAvailableChainsOptions = {}): SupportedChainId[] {
  // 1. Load feature flag for chain being enabled
  const isSolanaAvailable = getIsSolanaAvailable(useFeatureFlags())

  return useMemo(
    // 2. Conditionally build a list of chain ids to exclude
    // () => getAvailableChains(isBaseEnabled ? undefined : [SupportedChainId.BASE]),  <-- example usage, kept for reference
    () => {
      const chainsToSkip: SupportedChainId[] = []

      if (!isSolanaAvailable || excludeSolana) {
        chainsToSkip.push(SupportedChainId.SOLANA)
      }

      return getAvailableSourceChains(chainsToSkip)
    },
    [isSolanaAvailable, excludeSolana],
  )
}
