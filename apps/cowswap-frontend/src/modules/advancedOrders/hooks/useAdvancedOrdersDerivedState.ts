import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { TradeType } from 'modules/trade'
import { useBuildTradeDerivedState } from 'modules/trade/hooks/useBuildTradeDerivedState'

import {
  advancedOrdersAtom,
  AdvancedOrdersDerivedState,
  advancedOrdersDerivedStateAtom,
} from '../state/advancedOrdersAtom'

export function useAdvancedOrdersDerivedState(): AdvancedOrdersDerivedState {
  return useAtomValue(advancedOrdersDerivedStateAtom)
}

export function useFillAdvancedOrdersDerivedState() {
  const rawState = useAtomValue(advancedOrdersAtom)
  const updateDerivedState = useSetAtom(advancedOrdersDerivedStateAtom)

  const derivedState = useBuildTradeDerivedState(advancedOrdersAtom)
  const isUnlocked = rawState.isUnlocked

  useEffect(() => {
    updateDerivedState({ ...derivedState, isUnlocked, tradeType: TradeType.ADVANCED_ORDERS })
  }, [derivedState, isUnlocked, updateDerivedState])
}
