import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useAvailableChains } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { ALPHA_NETWORK_IDS } from './const'
import { alphaNetworksEnabledAtom } from './state/alphaNetworksEnabledAtom'

/**
 * Available chains, minus the alpha networks the user has not opted into.
 */
export function useVisibleChains(): SupportedChainId[] {
  const availableChains = useAvailableChains()
  const areAlphaNetworksEnabled = useAtomValue(alphaNetworksEnabledAtom)

  return useMemo(() => {
    if (areAlphaNetworksEnabled || ALPHA_NETWORK_IDS.length === 0) return availableChains

    return availableChains.filter((chainId) => !ALPHA_NETWORK_IDS.includes(chainId))
  }, [availableChains, areAlphaNetworksEnabled])
}
