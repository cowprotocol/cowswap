import { useCallback } from 'react'
import { useAtomValue } from 'jotai'

import { Field } from 'state/swap/actions'
import { limitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { toFirstMeaningfulDecimal } from '@cow/modules/limitOrders/utils/toFirstMeaningfulDecimal'
import { Fraction } from '@uniswap/sdk-core'
import { toFraction } from '@cow/modules/limitOrders/utils/toFraction'

// Applies rate to provided value which can be INPUT or OUTPUT
export function useApplyLimitRate() {
  const { activeRate, isInversed, isTypedValue } = useAtomValue(limitRateAtom)

  return useCallback(
    (value: string | null, field: Field): string | null | undefined => {
      if (!value || !Number(value) || !activeRate || activeRate.equalTo(0)) {
        return null
      }

      let output: Fraction | null = null
      const parsedValue = toFraction(value)
      // We need to invert rate only when its typed value
      const parsedRate = isInversed && isTypedValue ? activeRate.invert() : activeRate

      // If the field is INPUT we will MULTIPLY passed value and rate
      if (field === Field.INPUT) {
        output = parsedValue.multiply(parsedRate)

        // If the field is OUTPUT we will DIVIDE passed value and rate
      } else if (field === Field.OUTPUT) {
        output = parsedValue.divide(parsedRate)
      }

      // We need to return string and we also limit the decimals
      return toFirstMeaningfulDecimal(output?.toFixed(20))
    },
    [activeRate, isInversed, isTypedValue]
  )
}
