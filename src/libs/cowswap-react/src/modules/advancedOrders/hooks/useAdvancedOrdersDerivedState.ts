import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

import { useBuildTradeDerivedState } from 'modules/trade/hooks/useBuildTradeDerivedState'
import { TradeDerivedState } from 'modules/trade/types/TradeDerivedState'

import { advancedOrdersAtom, advancedOrdersDerivedStateAtom } from '../state/advancedOrdersAtom'

export function useAdvancedOrdersDerivedState(): TradeDerivedState {
  return useAtomValue(advancedOrdersDerivedStateAtom)
}

export function useFillAdvancedOrdersDerivedState() {
  const updateDerivedState = useUpdateAtom(advancedOrdersDerivedStateAtom)

  const derivedState = useBuildTradeDerivedState(advancedOrdersAtom)

  useEffect(() => {
    updateDerivedState(derivedState)
  }, [derivedState, updateDerivedState])
}
