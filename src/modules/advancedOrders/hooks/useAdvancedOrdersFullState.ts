import { advancedOrdersAtom, advancedOrdersDerivedStateAtom } from 'modules/advancedOrders'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useBuildTradeDerivedState } from 'modules/trade/hooks/useBuildTradeDerivedState'
import { useEffect } from 'react'
import { TradeDerivedState } from 'modules/trade/types/TradeDerivedState'

export function useAdvancedOrdersFullState(): TradeDerivedState {
  return useAtomValue(advancedOrdersDerivedStateAtom)
}

export function useFillAdvancedOrdersFullState() {
  const updateFullState = useUpdateAtom(advancedOrdersDerivedStateAtom)

  const fullState = useBuildTradeDerivedState(advancedOrdersAtom)

  useEffect(() => {
    updateFullState(fullState)
  }, [fullState, updateFullState])
}
