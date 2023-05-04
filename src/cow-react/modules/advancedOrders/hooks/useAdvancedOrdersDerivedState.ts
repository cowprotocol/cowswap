import { advancedOrdersAtom, advancedOrdersDerivedStateAtom } from '@cow/modules/advancedOrders'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useBuildTradeDerivedState } from '@cow/modules/trade/hooks/useBuildTradeDerivedState'
import { useEffect } from 'react'
import { TradeDerivedState } from '@cow/modules/trade/types/TradeDerivedState'

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
