import { useCallback } from 'react'
import { useAtom } from 'jotai'

import { limitOrdersAtom } from '../state/limitOrdersAtom'
import { limitRateAtom } from '../state/limitRateAtom'

// Rounds number only if the number of decimals goes above the decimals param
export const limitDecimals = (amount: number, decimals: number): number => {
  return +parseFloat(amount?.toFixed(decimals))
}

// Applies rate to provided value which can be INPUT or OUTPUT
export function useCalculateRate() {
  const [limitState] = useAtom(limitOrdersAtom)
  const [rateState] = useAtom(limitRateAtom)

  const { inputCurrencyAmount, outputCurrencyAmount } = limitState
  const { activeRate, isInversed } = rateState

  return useCallback(() => {
    const inputValue = Number(inputCurrencyAmount)
    const outputValue = Number(outputCurrencyAmount)

    let newRate

    if (!activeRate) {
      newRate = null
    } else if (isInversed) {
      newRate = outputValue / inputValue
    } else {
      newRate = inputValue / outputValue
    }

    if (newRate !== null) {
      newRate = String(limitDecimals(newRate, 4))
    }

    return newRate
  }, [inputCurrencyAmount, outputCurrencyAmount, activeRate, isInversed])
}
