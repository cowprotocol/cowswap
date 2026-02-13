import { useMemo } from 'react'

import { isSupportedChainId } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useChainsToSelect } from './useChainsToSelect'
import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

export function useSourceChainId(): { chainId: number; source: 'wallet' | 'selector' } {
  const { chainId } = useWalletInfo()
  const { selectedTargetChainId = chainId, open } = useSelectTokenWidgetState()
  const chainsToSelect = useChainsToSelect()
  const targetChainId = chainsToSelect?.defaultChainId ?? selectedTargetChainId

  return useMemo(() => {
    // return target chain when selector is open and viewing a different chain
    // This applies to both input and output fields for bridging balance fetching
    if (open && isSupportedChainId(targetChainId) && targetChainId !== chainId) {
      return { chainId: targetChainId, source: 'selector' }
    }

    return { chainId, source: 'wallet' }
  }, [open, chainId, targetChainId])
}
