import { useCallback } from 'react'
import { useAtom } from 'jotai'

import { Field } from 'state/swap/actions'
import { limitRateAtom } from '../state/limitRateAtom'
import { limitOrdersAtom } from '../state/limitOrdersAtom'

export function useApplyLimitRate() {
  const [rateState] = useAtom(limitRateAtom)
  const [limitState, setLimitState] = useAtom(limitOrdersAtom)

  return useCallback(
    ({ rateValue = rateState.rateValue, inputValue = limitState.inputCurrencyAmount }): void | null => {
      if (!rateValue) {
        return null
      }

      const outputCurrencyAmount = String(
        rateState.primaryField === Field.INPUT ? inputValue * rateValue : inputValue / rateValue
      )

      setLimitState((c) => ({ ...c, outputCurrencyAmount }))
    },
    [limitState, rateState.primaryField, rateState.rateValue, setLimitState]
  )
}
