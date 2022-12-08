import { useCallback } from 'react'
import { useAtomValue } from 'jotai'

import { Field } from 'state/swap/actions'
import { limitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { Fraction } from '@uniswap/sdk-core'
import { toFraction } from '@cow/modules/limitOrders/utils/toFraction'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import JSBI from 'jsbi'

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

      /**
       * Consider a trade DAI (decimals 18) <-> USDC (decimals 6)
       * 1. When input is 9 DAI, the value equals 9000000000000000000
       * Then we should divide it to get value for USDC = 9000000 (6 decimals)
       *
       * 2. When input is 9 USDC, the value equals 9000000
       * Then we should multiply to get value for DAI = 9000000000000000000 (18 decimals)
       */
      const shouldMultiplyInput = field === Field.INPUT && inputDecimals < outputDecimals
      const shouldMultiplyOutput = field === Field.OUTPUT && outputDecimals < inputDecimals
      const decimalsShift = JSBI.BigInt(10 ** Math.abs(inputDecimals - outputDecimals))

      const parsedValue = ((fraction) => {
        if (inputDecimals === outputDecimals) return fraction

        if (shouldMultiplyInput || shouldMultiplyOutput) {
          return fraction.multiply(decimalsShift)
        }

        return fraction.divide(decimalsShift)
      })(toFraction(value))

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
