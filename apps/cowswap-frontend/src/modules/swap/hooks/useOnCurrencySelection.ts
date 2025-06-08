import { useCallback } from 'react'

import { getIsNativeToken, isSellOrder } from '@cowprotocol/common-utils'
import { Currency } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

import { useNavigateOnCurrencySelection, useOnCurrencySelection as useTradeOnCurrencySelection } from 'modules/trade'

import { useSwapDerivedState } from './useSwapDerivedState'
import { useUpdateSwapRawState } from './useUpdateSwapRawState'

import { SELL_ETH_RESET_STATE } from '../consts'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOnCurrencySelection() {
  const { orderKind } = useSwapDerivedState()
  const tradeOnCurrencySelection = useTradeOnCurrencySelection()
  const updateSwapState = useUpdateSwapRawState()
  const navigateOnCurrencySelection = useNavigateOnCurrencySelection()

  return useCallback(
    (field: Field, currency: Currency | null) => {
      // Same logic as in getEthFlowOverridesOnSwitch()
      if (!isSellOrder(orderKind) && currency && getIsNativeToken(currency)) {
        navigateOnCurrencySelection(field, currency, () => {
          updateSwapState(SELL_ETH_RESET_STATE)
        })
        return
      }

      return tradeOnCurrencySelection(field, currency)
    },
    [tradeOnCurrencySelection, navigateOnCurrencySelection, orderKind, updateSwapState],
  )
}
