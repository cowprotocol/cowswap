import { useCallback } from 'react'
import { useUpdateAtom } from 'jotai/utils'

import { updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'

export function useHandleError() {
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)

  return useCallback(
    (error) => {
      updateLimitRateState({ executionRate: null })
      console.debug('[useFetchMarketPrice] Failed to fetch exection price', error)
    },
    [updateLimitRateState]
  )
}
