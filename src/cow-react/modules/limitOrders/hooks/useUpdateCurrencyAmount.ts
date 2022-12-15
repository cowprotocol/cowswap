import { useCallback } from 'react'
import { useUpdateAtom } from 'jotai/utils'

import { OrderKind } from '@cowprotocol/contracts'
import { LimitOrdersState, updateLimitOrdersAtom } from '@cow/modules/limitOrders/state/limitOrdersAtom'
import { useApplyLimitRate } from '@cow/modules/limitOrders/hooks/useApplyLimitRate'
import { Field } from 'state/swap/actions'
import { FractionUtils } from '@cow/utils/fractionUtils'
import { Fraction } from '@uniswap/sdk-core'
import { Writeable } from '@cow/types'

type CurrencyAmountProps = {
  inputCurrencyAmount?: Fraction | null
  outputCurrencyAmount?: Fraction | null
  orderKind?: OrderKind
  keepOrderKind?: boolean
}

export function useUpdateCurrencyAmount() {
  const applyLimitRate = useApplyLimitRate()
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersAtom)

  return useCallback(
    (params: CurrencyAmountProps) => {
      const update: Partial<Writeable<LimitOrdersState>> = {}
      const { inputCurrencyAmount, outputCurrencyAmount, keepOrderKind } = params

      if (params.orderKind) {
        update.orderKind = params.orderKind
      }

      // Handle INPUT amount change
      if (inputCurrencyAmount !== undefined) {
        // Calculate OUTPUT amount by applying the rate
        const outputWithRate = applyLimitRate(inputCurrencyAmount, Field.INPUT)
        update.outputCurrencyAmount = FractionUtils.serializeFractionToJSON(outputWithRate)
        update.inputCurrencyAmount = FractionUtils.serializeFractionToJSON(inputCurrencyAmount)

        // Update order type only if keeOrderKind param is not true
        if (!keepOrderKind) {
          update.orderKind = OrderKind.SELL
        }
      }

      // Handle OUTPUT amount change
      if (outputCurrencyAmount !== undefined) {
        // Calculate INPUT amount by applying the rate
        const inputWithRate = applyLimitRate(outputCurrencyAmount, Field.OUTPUT)
        update.inputCurrencyAmount = FractionUtils.serializeFractionToJSON(inputWithRate)
        update.outputCurrencyAmount = FractionUtils.serializeFractionToJSON(outputCurrencyAmount)

        // Update order type only if keeOrderKind param is not true
        if (!keepOrderKind) {
          update.orderKind = OrderKind.BUY
        }
      }

      // Continue with the state update
      updateLimitOrdersState(update)
    },
    [applyLimitRate, updateLimitOrdersState]
  )
}
