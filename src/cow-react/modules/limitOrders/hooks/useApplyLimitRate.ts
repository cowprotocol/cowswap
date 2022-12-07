import { useCallback } from 'react'
import { useAtomValue } from 'jotai'

import { Field } from 'state/swap/actions'
import { limitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { Fraction } from '@uniswap/sdk-core'
import { toFraction } from '@cow/modules/limitOrders/utils/toFraction'

// Applies rate to provided value which can be INPUT or OUTPUT
export function useApplyLimitRate() {
  const { activeRate } = useAtomValue(limitRateAtom)

  return useCallback(
    (value: string | null, field: Field): string | null | undefined => {
      if (!value || !Number(value) || !activeRate || activeRate.equalTo(0)) {
        return null
      }

      let output: Fraction | null = null
      const parsedValue = toFraction(value)

      // If the field is INPUT we will MULTIPLY passed value and rate
      if (field === Field.INPUT) {
        output = parsedValue.multiply(activeRate)

        // If the field is OUTPUT we will DIVIDE passed value and rate
      } else if (field === Field.OUTPUT) {
        output = parsedValue.divide(activeRate)
      }

      // We need to return string and we also limit the decimals
      return output?.toSignificant(6)
    },
    [activeRate]
  )
}
