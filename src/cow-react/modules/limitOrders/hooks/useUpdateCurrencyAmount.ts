import { useCallback } from 'react'
import { useUpdateAtom } from 'jotai/utils'
import { updateLimitOrdersAtom } from '@cow/modules/limitOrders/state/limitOrdersAtom'
import { useApplyLimitRate } from '@cow/modules/limitOrders/hooks/useApplyLimitRate'
import { Field } from 'state/swap/actions'

type CurrencyAmountProps = {
  inputCurrencyAmount?: string | null
  outputCurrencyAmount?: string | null
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

        if (outputWithRate) {
          update.outputCurrencyAmount = outputWithRate
        }
      }

      // Handle OUTPUT amount change
      if (outputCurrencyAmount !== undefined) {
        // Calculate INPUT amount by applying the rate
        const inputWithRate = applyLimitRate(outputCurrencyAmount, Field.OUTPUT)

        if (inputWithRate) {
          update.inputCurrencyAmount = inputWithRate
        }
      }

      // Continue with the state update
      updateLimitOrdersState(update)
    },
    [applyLimitRate, updateLimitOrdersState]
  )
}
