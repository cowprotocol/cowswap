import { useCallback } from 'react'

import { getIsNativeToken, isSellOrder } from '@cowprotocol/common-utils'
import { Currency } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

import { useOnCurrencySelection as useTradeOnCurrencySelection } from 'modules/trade'

import { useSwapDerivedState } from './useSwapDerivedState'
import { useUpdateSwapRawState } from './useUpdateSwapRawState'

import { SELL_ETH_RESET_STATE } from '../consts'

export function useOnCurrencySelection() {
  const { orderKind } = useSwapDerivedState()
  const tradeOnCurrencySelection = useTradeOnCurrencySelection()
  const updateSwapState = useUpdateSwapRawState()

  return useCallback(
    (field: Field, currency: Currency | null) => {
      // Same logic as in getEthFlowOverridesOnSwitch()
      if (!isSellOrder(orderKind) && currency && getIsNativeToken(currency)) {
        updateSwapState(SELL_ETH_RESET_STATE)
        return
      }

      return tradeOnCurrencySelection(field, currency)
    },
    [tradeOnCurrencySelection, orderKind, updateSwapState],
  )
}
