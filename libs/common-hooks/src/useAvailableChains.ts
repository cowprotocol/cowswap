import { useMemo } from 'react'

import { getAvailableChains } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * Hook to get a list of SupportedChainId currently available/enabled
 *
 * Normally it is the exact same list of chains in the SupportChainId enum.
 * It'll be different when a chain is behind a feature flag.
 * Set the flag in this hook.
 */
export function useAvailableChains(): SupportedChainId[] {
  // 1. Load feature flag for chain being enabled
  // const { isArbitrumOneEnabled } = useFeatureFlags()

  return useMemo(
    // 2. Conditionally build a list of chain ids to exclude
    // () => getAvailableChains(isArbitrumOneEnabled ? undefined : [SupportedChainId.ARBITRUM_ONE]),
    () => getAvailableChains(),
    []
  )
}
