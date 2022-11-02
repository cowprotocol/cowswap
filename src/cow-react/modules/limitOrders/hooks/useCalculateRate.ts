import { useCallback } from 'react'
import { useAtomValue } from 'jotai'
import { BigNumber } from 'bignumber.js'

import { limitOrdersAtom } from '../state/limitOrdersAtom'
import { limitRateAtom } from '../state/limitRateAtom'
import { toFirstMeaningfulDecimal } from '../utils/toFirstMeaningfulDecimal'

// Applies rate to provided value which can be INPUT or OUTPUT
export function useCalculateRate() {
  const { inputCurrencyAmount, outputCurrencyAmount } = useAtomValue(limitOrdersAtom)
  const { activeRate, isInversed } = useAtomValue(limitRateAtom)

  return useCallback(() => {
    if (!inputCurrencyAmount || !outputCurrencyAmount) {
      return null
    }

    const inputValue = new BigNumber(inputCurrencyAmount)
    const outputValue = new BigNumber(outputCurrencyAmount)

    let newRate

    if (!activeRate || !inputValue || !outputValue) {
      newRate = null
    } else if (isInversed) {
      newRate = outputValue.div(inputValue)
    } else {
      newRate = inputValue.div(outputValue)
    }

    if (newRate !== null) {
      newRate = toFirstMeaningfulDecimal(newRate.toString())
    }

    return newRate
  }, [inputCurrencyAmount, outputCurrencyAmount, activeRate, isInversed])
}
