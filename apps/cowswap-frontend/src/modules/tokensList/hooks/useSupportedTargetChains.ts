import { useMemo } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { useAvailableTargetChains, useFeatureFlags } from '@cowprotocol/common-hooks'
import { AdditionalTargetChainId, ChainInfo, isAdditionalTargetChain } from '@cowprotocol/cow-sdk'

import { mapChainInfo } from '../utils/mapChainInfo'

/**
 * Returns the list of supported destination (buy-side) chains as ChainInfo[].
 * Includes non-EVM chains (BTC, Solana) when their bridge feature flags are enabled.
 */
export function useSupportedTargetChains(): ChainInfo[] {
  const availableTargetChains = useAvailableTargetChains()
  const { isBtcBridgeEnabled, isSolBridgeEnabled } = useFeatureFlags()

  const additionalChains = useMemo(() => {
    const set = new Set<AdditionalTargetChainId>()
    if (isBtcBridgeEnabled) set.add(AdditionalTargetChainId.BITCOIN)
    if (isSolBridgeEnabled) set.add(AdditionalTargetChainId.SOLANA)
    return set
  }, [isBtcBridgeEnabled, isSolBridgeEnabled])

  return useMemo(() => {
    return availableTargetChains.reduce((acc, id) => {
      if (isAdditionalTargetChain(id) && !additionalChains.has(id)) {
        return acc
      }

      const info = CHAIN_INFO[id]
      if (info) acc.push(mapChainInfo(id, info))
      return acc
    }, [] as ChainInfo[])
  }, [availableTargetChains, additionalChains])
}
