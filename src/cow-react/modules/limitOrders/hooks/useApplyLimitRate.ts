import { useCallback } from 'react'
import { useLimitRateStateManager } from '..//state/limitRateAtom'
import { Field } from 'state/swap/actions'

export function useApplyLimitRate() {
  const rateState = useLimitRateStateManager()

  return useCallback(
    (inputValue: string | null) => {
      const { primaryField, rateValue } = rateState.state

      if (!rateValue) {
        return null
      }

      const rateAmount = Number(rateValue)
      const inputAmount = Number(inputValue)
      const outputAmount = primaryField === Field.INPUT ? inputAmount * rateAmount : inputAmount / rateAmount
      return String(outputAmount)
    },
    [rateState.state]
  )
}
