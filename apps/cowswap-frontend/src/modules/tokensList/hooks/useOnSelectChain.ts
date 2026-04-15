import { useCallback } from 'react'

import { ChainInfo } from '@cowprotocol/cow-sdk'

import { Field } from 'legacy/state/types'

import { TradeType } from 'modules/trade'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'
import { useUpdateSelectTokenWidgetState } from './useUpdateSelectTokenWidgetState'

type OnSelectChainHandler = (chain: ChainInfo) => void

export function useOnSelectChain(): OnSelectChainHandler {
  const updateSelectTokenWidget = useUpdateSelectTokenWidgetState()
  const widgetState = useSelectTokenWidgetState()
  const shouldForceOpen =
    widgetState.field === Field.INPUT &&
    (widgetState.tradeType === TradeType.LIMIT_ORDER || widgetState.tradeType === TradeType.ADVANCED_ORDERS)
  // Limit/TWAP sells keep the widget pinned while the user flips chains; forceOpen keeps that behavior intact.

  return useCallback(
    (chain: ChainInfo) => {
      updateSelectTokenWidget({
        selectedTargetChainId: chain.id,
        open: true,
        forceOpen: shouldForceOpen,
      })
    },
    [updateSelectTokenWidget, shouldForceOpen],
  )
}
