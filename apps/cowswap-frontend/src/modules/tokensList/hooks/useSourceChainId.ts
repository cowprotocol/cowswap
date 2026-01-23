import { useMemo } from 'react'

import { isSupportedChainId } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

export function useSourceChainId(): { chainId: number; source: 'wallet' | 'selector' } {
  const { chainId } = useWalletInfo()
  const { selectedTargetChainId = chainId, open } = useSelectTokenWidgetState()

  return useMemo(() => {
    // return target chain when selector is open and viewing a different chain
    // This applies to both input and output fields for bridging balance fetching
    if (open && isSupportedChainId(selectedTargetChainId) && selectedTargetChainId !== chainId) {
      return { chainId: selectedTargetChainId, source: 'selector' }
    }

    return { chainId, source: 'wallet' }
  }, [open, chainId, selectedTargetChainId])
}
