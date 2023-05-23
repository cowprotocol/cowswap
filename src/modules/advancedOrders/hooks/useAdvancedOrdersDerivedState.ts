import { advancedOrdersAtom, advancedOrdersDerivedStateAtom } from '../state/advancedOrdersAtom'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useBuildTradeDerivedState } from 'modules/trade/hooks/useBuildTradeDerivedState'
import { useEffect } from 'react'
import { TradeDerivedState } from 'modules/trade/types/TradeDerivedState'

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
