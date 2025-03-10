import { useCallback } from 'react'

import { ChainInfo } from '@cowprotocol/types'
import { useSwitchNetwork } from '@cowprotocol/wallet'

import { Field } from 'legacy/state/types'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'
import { useUpdateSelectTokenWidgetState } from './useUpdateSelectTokenWidgetState'

export function useOnSelectChain() {
  const switchNetwork = useSwitchNetwork()
  const { field } = useSelectTokenWidgetState()
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()

  return useCallback(
    (chain: ChainInfo) => {
      if (!field) {
        console.error('Field is not set in useOnSelectChain()')
        return
      }

      if (field === Field.INPUT) {
        switchNetwork(chain.id)
      } else {
        updateSelectTokenWidget({ selectedTargetChainId: chain.id })
      }
    },
    [field, updateSelectTokenWidget, switchNetwork],
  )
}
