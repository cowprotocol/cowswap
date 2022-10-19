import { useCallback } from 'react'
import { useUpdateAtom } from 'jotai/utils'

import { OrderKind } from '@cowprotocol/contracts'
import { updateLimitOrdersAtom } from '@cow/modules/limitOrders/state/limitOrdersAtom'
import { useApplyLimitRate } from '@cow/modules/limitOrders/hooks/useApplyLimitRate'
import { Field } from 'state/swap/actions'

type CurrencyAmountProps = {
  inputCurrencyAmount?: string | null
  outputCurrencyAmount?: string | null
  orderKind?: OrderKind
}

export function useUpdateCurrencyAmount() {
  const applyLimitRate = useApplyLimitRate()
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersAtom)

  return useCallback(
    (params: CurrencyAmountProps) => {
      const update = { ...params } as CurrencyAmountProps
      const { inputCurrencyAmount, outputCurrencyAmount } = params

      // Handle INPUT amount change
      if (inputCurrencyAmount !== undefined) {
        // Calculate OUTPUT amount by applying the rate
        const outputWithRate = applyLimitRate(inputCurrencyAmount, Field.INPUT)
        update.outputCurrencyAmount = outputWithRate
        update.orderKind = OrderKind.SELL
      }

      // Handle OUTPUT amount change
      if (outputCurrencyAmount !== undefined) {
        // Calculate INPUT amount by applying the rate
        const inputWithRate = applyLimitRate(outputCurrencyAmount, Field.OUTPUT)
        update.inputCurrencyAmount = inputWithRate
        update.orderKind = OrderKind.BUY
      }

      // Continue with the state update
      updateLimitOrdersState(update)
    },
    [applyLimitRate, updateLimitOrdersState]
  )
}
