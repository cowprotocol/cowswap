import { useCallback, useRef } from 'react'

import { FractionUtils } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

import { useSwapDerivedState } from './useSwapDerivedState'
import { useUpdateSwapRawState } from './useUpdateSwapRawState'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUpdateCurrencyAmount() {
  const { inputCurrencyAmount, outputCurrencyAmount } = useSwapDerivedState()
  const updateSwapState = useUpdateSwapRawState()

  const inputCurrencyAmountRef = useRef(inputCurrencyAmount)
  inputCurrencyAmountRef.current = inputCurrencyAmount
  const outputCurrencyAmountRef = useRef(outputCurrencyAmount)
  outputCurrencyAmountRef.current = outputCurrencyAmount

  return useCallback(
    (field: Field, value: CurrencyAmount<Currency> | undefined) => {
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
  value: CurrencyAmount<Currency> | undefined,
  inputAmount: CurrencyAmount<Currency> | null,
  outputAmount: CurrencyAmount<Currency> | null,
): CurrencyAmount<Currency> | null {
  if (!inputAmount || !outputAmount) return null

  if (!value || value.equalTo(0) || inputAmount.equalTo(0) || outputAmount.equalTo(0)) {
    return CurrencyAmount.fromRawAmount((isInputAmountChanged ? outputAmount : inputAmount).currency, 0)
  }

  try {
    const price = new Price({ baseAmount: inputAmount, quoteAmount: outputAmount })

    return isInputAmountChanged ? price.quote(value) : price.invert().quote(value)
  } catch (error) {
    console.error('Error calculating opposite amount:', error)
    return null
  }
}
