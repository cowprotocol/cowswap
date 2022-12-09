import { useCallback } from 'react'
import { useAtomValue } from 'jotai'

import { Field } from 'state/swap/actions'
import { limitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { Fraction } from '@uniswap/sdk-core'
import { toFraction } from '@cow/modules/limitOrders/utils/toFraction'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { adjustDecimals } from '@cow/modules/limitOrders/utils/adjustDecimals'

// Applies rate to provided value which can be INPUT or OUTPUT
export function useApplyLimitRate() {
  const { activeRate } = useAtomValue(limitRateAtom)
  const { inputCurrency, outputCurrency } = useLimitOrdersTradeState()

  return useCallback(
    (value: string | null, field: Field): Fraction | null => {
      if (!value || !Number(value) || !activeRate || activeRate.equalTo(0) || !inputCurrency || !outputCurrency) {
        return null
      }

      const { decimals: inputDecimals } = inputCurrency
      const { decimals: outputDecimals } = outputCurrency

      const parsedValue = adjustDecimals(
        toFraction(value),
        field === Field.INPUT ? inputDecimals : outputDecimals,
        field === Field.INPUT ? outputDecimals : inputDecimals
      )

      if (field === Field.INPUT) {
        return parsedValue.multiply(activeRate)
      }

      if (field === Field.OUTPUT) {
        return parsedValue.divide(activeRate)
      }

      return null
    },
    [activeRate, inputCurrency, outputCurrency]
  )
}
