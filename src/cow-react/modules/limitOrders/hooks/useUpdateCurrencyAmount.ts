import { useCallback } from 'react'
import { useUpdateAtom } from 'jotai/utils'

import { OrderKind } from '@cowprotocol/contracts'
import { LimitOrdersState, updateLimitOrdersAtom } from '@cow/modules/limitOrders/state/limitOrdersAtom'
import { calculateAmountForRate } from '@cow/modules/limitOrders/utils/calculateAmountForRate'
import { Field } from 'state/swap/actions'
import { FractionUtils } from '@cow/utils/fractionUtils'
import { Fraction } from '@uniswap/sdk-core'
import { Writeable } from '@cow/types'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'

type CurrencyAmountProps = {
  activeRate: Fraction | null
  inputCurrencyAmount?: Fraction | null
  outputCurrencyAmount?: Fraction | null
  orderKind?: OrderKind
  keepOrderKind?: boolean
}

export function useUpdateCurrencyAmount() {
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersAtom)
  const { inputCurrency, outputCurrency } = useLimitOrdersTradeState()

  return useCallback(
    (params: CurrencyAmountProps) => {
      const update: Partial<Writeable<LimitOrdersState>> = {}
      const { activeRate, inputCurrencyAmount, outputCurrencyAmount, keepOrderKind } = params

      if (params.orderKind) {
        update.orderKind = params.orderKind
      }

      // Handle INPUT amount change
      if (inputCurrencyAmount !== undefined) {
        // Calculate OUTPUT amount by applying the rate
        const outputWithRate = calculateAmountForRate({
          activeRate,
          amount: inputCurrencyAmount,
          field: Field.INPUT,
          inputCurrency,
          outputCurrency,
        })
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
        const inputWithRate = calculateAmountForRate({
          activeRate,
          amount: outputCurrencyAmount,
          field: Field.OUTPUT,
          inputCurrency,
          outputCurrency,
        })
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
    [inputCurrency, outputCurrency, updateLimitOrdersState]
  )
}
