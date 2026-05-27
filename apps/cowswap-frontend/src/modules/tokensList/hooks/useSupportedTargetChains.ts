import { useMemo } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { useAvailableTargetChains, useFeatureFlags } from '@cowprotocol/common-hooks'
import {
  AdditionalTargetChainId,
  ChainInfo,
  isAdditionalTargetChain,
  isSolanaChain,
  SupportedChainId,
  TargetChainId,
} from '@cowprotocol/cow-sdk'

import { mapChainInfo } from '../utils/mapChainInfo'

/**
 * Returns the list of supported destination (buy-side) chains as ChainInfo[].
 * Includes non-EVM chains (BTC, Solana) when their bridge feature flags are enabled.
 *
 * Note: as of the cow-sdk Solana-as-supported migration, Solana lives in `SupportedChainId`
 * (not `AdditionalTargetChainId`), but cowswap still treats it as bridge-only — gated by
 * `isSolBridgeEnabled` — until full Solana wallet support lands.
 */
export function useSupportedTargetChains(): ChainInfo[] {
  const availableTargetChains = useAvailableTargetChains()
  const { isBtcBridgeEnabled, isSolBridgeEnabled } = useFeatureFlags()

  const enabledBridgeOnlyChains = useMemo(() => {
    const set = new Set<TargetChainId>()
    if (isBtcBridgeEnabled) set.add(AdditionalTargetChainId.BITCOIN)
    if (isSolBridgeEnabled) set.add(SupportedChainId.SOLANA)
    return set
  }, [isBtcBridgeEnabled, isSolBridgeEnabled])

  return useMemo(() => {
    return availableTargetChains.reduce((acc, id) => {
      // BTC (in AdditionalTargetChainId) and SOLANA (in SupportedChainId, post-migration)
      // are both bridge-only destinations gated by their respective feature flags.
      const isBridgeOnly = isAdditionalTargetChain(id) || isSolanaChain(id)
      if (isBridgeOnly && !enabledBridgeOnlyChains.has(id)) {
        return acc
      }

      const info = CHAIN_INFO[id]
      if (info) acc.push(mapChainInfo(id, info))
      return acc
    }, [] as ChainInfo[])
  }, [availableTargetChains, enabledBridgeOnlyChains])
}
