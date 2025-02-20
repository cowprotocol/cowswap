import { useCallback, useRef } from 'react'

import { FractionUtils } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

import { useSwapDerivedState } from './useSwapDerivedState'
import { useUpdateSwapRawState } from './useUpdateSwapRawState'

export function useUpdateCurrencyAmount() {
  const { inputCurrencyAmount, outputCurrencyAmount } = useSwapDerivedState()
  const updateSwapState = useUpdateSwapRawState()

  const inputCurrencyAmountRef = useRef(inputCurrencyAmount)
  inputCurrencyAmountRef.current = inputCurrencyAmount
  const outputCurrencyAmountRef = useRef(outputCurrencyAmount)
  outputCurrencyAmountRef.current = outputCurrencyAmount

  return useCallback(
    (field: Field, value: CurrencyAmount<Currency>) => {
      const isInputAmountChanged = field === Field.INPUT
      const targetField = isInputAmountChanged ? 'inputCurrencyAmount' : 'outputCurrencyAmount'
      const oppositeField = !isInputAmountChanged ? 'inputCurrencyAmount' : 'outputCurrencyAmount'

      const oppositeNewValue = calculateOppositeAmount(
        isInputAmountChanged,
        value,
        inputCurrencyAmountRef.current,
        outputCurrencyAmountRef.current,
      )

      updateSwapState({
        orderKind: isInputAmountChanged ? OrderKind.SELL : OrderKind.BUY,
        [targetField]: FractionUtils.serializeFractionToJSON(value),
        // Optimistically update the opposite field based on the current price
        ...(oppositeNewValue ? { [oppositeField]: FractionUtils.serializeFractionToJSON(oppositeNewValue) } : null),
      })
    },
    [updateSwapState],
  )
}

/**
 * While user is typing in one of the input fields, calculate the opposite amount based on the current price
 */
function calculateOppositeAmount(
  isInputAmountChanged: boolean,
  value: CurrencyAmount<Currency>,
  inputAmount: CurrencyAmount<Currency> | null,
  outputAmount: CurrencyAmount<Currency> | null,
): CurrencyAmount<Currency> | null {
  if (!inputAmount || !outputAmount) return null
  const price = new Price({ baseAmount: inputAmount, quoteAmount: outputAmount })

  return isInputAmountChanged ? price.quote(value) : price.invert().quote(value)
}
