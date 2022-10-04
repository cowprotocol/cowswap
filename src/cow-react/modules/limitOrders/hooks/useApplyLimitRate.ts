import { useCallback } from 'react'
import { useAtom } from 'jotai'

import { Field } from 'state/swap/actions'
import { limitRateAtom } from '../state/limitRateAtom'

export function useApplyLimitRate() {
  const [rateState] = useAtom(limitRateAtom)
  const { activeRate, isInversed } = rateState

  return useCallback(
    (value: string | null, field: Field): string | null => {
      if (!activeRate || !value) {
        return null
      }

      let output

      if (isInversed) {
        field = field === Field.INPUT ? Field.OUTPUT : Field.INPUT
      }

      if (field === Field.INPUT) {
        output = Number(value) * activeRate
      }

      if (field === Field.OUTPUT) {
        output = Number(value) / activeRate
      }

      return String(output)
    },
    [activeRate, isInversed]
  )
}
