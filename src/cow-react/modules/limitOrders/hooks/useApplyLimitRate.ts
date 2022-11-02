import { useCallback } from 'react'
import { useAtomValue } from 'jotai'
import { BigNumber } from 'bignumber.js'

import { Field } from 'state/swap/actions'
import { limitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'

// Applies rate to provided value which can be INPUT or OUTPUT
export function useApplyLimitRate() {
  const { activeRate, isInversed } = useAtomValue(limitRateAtom)

  return useCallback(
    (value: string | null, field: Field): string | null | undefined => {
      if (!value || !activeRate) {
        return null
      }

      let output: BigNumber | null = null
      const parsedRate = new BigNumber(activeRate)
      const parsedValue = new BigNumber(value)

      // Switch the field param if isInversed value is true
      if (isInversed) {
        field = field === Field.INPUT ? Field.OUTPUT : Field.INPUT
      }

      // If the field is INPUT we will MULTIPLY passed value and rate
      if (field === Field.INPUT) {
        output = parsedValue.multipliedBy(parsedRate)

        // If the field is OUTPUT we will DIVIDE passed value and rate
      } else if (field === Field.OUTPUT) {
        output = parsedValue.dividedBy(parsedRate)
      }

      // We need to return string and we also limit the decimals
      return output?.toFixed(20)
    },
    [activeRate, isInversed]
  )
}
