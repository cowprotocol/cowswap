import { useCallback } from 'react'
import { useAtomValue } from 'jotai'

import { limitOrdersAtom } from '../state/limitOrdersAtom'
import { limitRateAtom } from '../state/limitRateAtom'
import { limitDecimals } from '../utils/limitDecimals'

// Applies rate to provided value which can be INPUT or OUTPUT
export function useCalculateRate() {
  const { inputCurrencyAmount, outputCurrencyAmount } = useAtomValue(limitOrdersAtom)
  const { activeRate, isInversed } = useAtomValue(limitRateAtom)

  return useCallback(() => {
    const inputValue = Number(inputCurrencyAmount)
    const outputValue = Number(outputCurrencyAmount)

    let newRate

    if (!activeRate || !inputValue || !outputValue) {
      newRate = null
    } else if (isInversed) {
      newRate = outputValue / inputValue
    } else {
      newRate = inputValue / outputValue
    }

    if (newRate !== null) {
      newRate = String(limitDecimals(newRate, 5))
    }

    return newRate
  }, [inputCurrencyAmount, outputCurrencyAmount, activeRate, isInversed])
}
