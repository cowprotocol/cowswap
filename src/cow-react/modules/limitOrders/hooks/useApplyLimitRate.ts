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
    (value: string | null, field: Field): Fraction | null => {
      if (!value || !Number(value) || !activeRate || activeRate.equalTo(0)) {
        return null
      }

      const parsedValue = toFraction(value)

      if (field === Field.INPUT) {
        return parsedValue.multiply(activeRate)
      }

      if (field === Field.OUTPUT) {
        return parsedValue.divide(activeRate)
      }

      return null
    },
    [activeRate]
  )
}
