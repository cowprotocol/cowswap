import { useCallback } from 'react'

import { ChainInfo } from '@cowprotocol/cow-sdk'

import { useUpdateSelectTokenWidgetState } from './useUpdateSelectTokenWidgetState'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOnSelectChain() {
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()

  return useCallback(
    (chain: ChainInfo) => {
      updateSelectTokenWidget({ selectedTargetChainId: chain.id })
    },
    [updateSelectTokenWidget],
  )
}
