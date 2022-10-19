import { useCallback } from 'react'
import { useAtomValue } from 'jotai'

import { Field } from 'state/swap/actions'
import { limitRateAtom } from '../state/limitRateAtom'
import { limitDecimals } from '../utils/limitDecimals'

// Applies rate to provided value which can be INPUT or OUTPUT
export function useApplyLimitRate() {
  const { activeRate, isInversed } = useAtomValue(limitRateAtom)

  return useCallback(
    (value: string | null, field: Field): string | null => {
      let output = 0
      const parsedRate = Number(activeRate)
      const parsedValue = Number(value)

      if (!parsedValue || !parsedRate) {
        return null
      }

      // Switch the field param if isInversed value is true
      if (isInversed) {
        field = field === Field.INPUT ? Field.OUTPUT : Field.INPUT
      }

      // If the field is INPUT we will MULTIPLY passed value and rate
      if (field === Field.INPUT) {
        output = parsedValue * parsedRate

        // If the field is OUTPUT we will DIVIDE passed value and rate
      } else if (field === Field.OUTPUT) {
        output = parsedValue / parsedRate
      }

      // We need to return string and we also limit the decimals
      return String(limitDecimals(output, 5))
    },
    [activeRate, isInversed]
  )
}
