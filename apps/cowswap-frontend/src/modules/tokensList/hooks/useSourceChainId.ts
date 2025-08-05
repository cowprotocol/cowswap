import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

export function useSourceChainId(): { chainId: number; source: 'wallet' | 'selector' } {
  const { chainId } = useWalletInfo()
  const { selectedTargetChainId = chainId, open } = useSelectTokenWidgetState()

  return useMemo(() => {
    // Source chainId should always be a value from SupportedChainId
    if (!open || !(selectedTargetChainId in SupportedChainId) || selectedTargetChainId === chainId) {
      return {
        chainId,
        source: 'wallet',
      }
    }

    return {
      chainId: selectedTargetChainId,
      source: 'selector',
    }
  }, [open, chainId, selectedTargetChainId])
}
