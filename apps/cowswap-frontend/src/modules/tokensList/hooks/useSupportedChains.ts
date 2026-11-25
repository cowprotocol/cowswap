import { useMemo } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { ChainInfo } from '@cowprotocol/cow-sdk'

import { useVisibleChains } from 'entities/alphaNetworks'

import { mapChainInfo } from '../utils/mapChainInfo'

/**
 * Returns the list of supported source (sell-side) chains as ChainInfo[].
 * Filters by feature flags and by alpha-network opt-in via useVisibleChains.
 */
export function useSupportedChains(): ChainInfo[] {
  const availableChains = useVisibleChains()

  return useMemo(() => {
    return availableChains.reduce((acc, id) => {
      const info = CHAIN_INFO[id]
      if (info) acc.push(mapChainInfo(id, info))
      return acc
    }, [] as ChainInfo[])
  }, [availableChains])
}
