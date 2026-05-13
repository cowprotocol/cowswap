import { useMemo } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { useAvailableChains } from '@cowprotocol/common-hooks'
import { ChainInfo } from '@cowprotocol/cow-sdk'

import { mapChainInfo } from '../utils/mapChainInfo'

/**
 * Returns the list of supported source (sell-side) chains as ChainInfo[].
 * Filters by feature flags via useAvailableChains.
 */
export function useSupportedChains(): ChainInfo[] {
  const availableChains = useAvailableChains()

  return useMemo(() => {
    return availableChains.reduce((acc, id) => {
      const info = CHAIN_INFO[id]
      if (info) acc.push(mapChainInfo(id, info))
      return acc
    }, [] as ChainInfo[])
  }, [availableChains])
}
