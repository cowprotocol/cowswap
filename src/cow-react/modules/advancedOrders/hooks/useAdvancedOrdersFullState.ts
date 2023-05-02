import { advancedOrdersAtom, advancedOrdersFullStateAtom } from '@cow/modules/advancedOrders'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useBuildTradeFullState } from '@cow/modules/trade/hooks/useBuildTradeFullState'
import { useEffect } from 'react'
import { TradeFullState } from '@cow/modules/trade/types/TradeFullState'

export function useAdvancedOrdersFullState(): TradeFullState {
  return useAtomValue(advancedOrdersFullStateAtom)
}

export function useFillAdvancedOrdersFullState() {
  const updateFullState = useUpdateAtom(advancedOrdersFullStateAtom)

  const fullState = useBuildTradeFullState(advancedOrdersAtom)

  useEffect(() => {
    updateFullState(fullState)
  }, [fullState, updateFullState])
}
