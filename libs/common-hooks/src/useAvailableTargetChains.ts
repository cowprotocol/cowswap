import { useMemo } from 'react'

import { getAvailableDestinationChains } from '@cowprotocol/common-utils'
import { AdditionalTargetChainId, SupportedChainId, TargetChainId } from '@cowprotocol/cow-sdk'

import { useFeatureFlags } from './useFeatureFlags'

/**
 * Hook to get a list of TargetChainId available as destination/buy-side chains.
 *
 * Similar to useAvailableChains but specifically for target (output) chains,
 * which may include non-EVM chains like Bitcoin and Solana when their
 * bridge feature flags are enabled.
 */
export function useAvailableTargetChains(): TargetChainId[] {
  const { isInkEnabled, isBtcBridgeEnabled, isSolBridgeEnabled } = useFeatureFlags()

  return useMemo(() => {
    const chainsToSkip: TargetChainId[] = []

    if (!isInkEnabled) {
      chainsToSkip.push(SupportedChainId.INK)
    }

    if (!isBtcBridgeEnabled) {
      chainsToSkip.push(AdditionalTargetChainId.BITCOIN)
    }

    if (!isSolBridgeEnabled) {
      chainsToSkip.push(AdditionalTargetChainId.SOLANA)
    }

    return getAvailableDestinationChains(chainsToSkip)
  }, [isInkEnabled, isBtcBridgeEnabled, isSolBridgeEnabled])
}
