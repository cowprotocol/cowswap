import { useCallback } from 'react'

import { ChainInfo } from '@cowprotocol/cow-sdk'

import { useUpdateSelectTokenWidgetState } from './useUpdateSelectTokenWidgetState'

export function useOnSelectChain() {
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()

  return useCallback(
    (chain: ChainInfo) => {
      updateSelectTokenWidget({ selectedTargetChainId: chain.id })
    },
    [updateSelectTokenWidget],
  )
}
