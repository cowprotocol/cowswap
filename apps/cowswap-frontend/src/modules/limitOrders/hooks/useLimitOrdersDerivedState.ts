import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import {
  limitOrdersRawStateAtom,
  LimitOrdersDerivedState,
  limitOrdersDerivedStateAtom,
} from 'modules/limitOrders/state/limitOrdersRawStateAtom'
import { useBuildTradeDerivedState } from 'modules/trade/hooks/useBuildTradeDerivedState'

export function useLimitOrdersDerivedState(): LimitOrdersDerivedState {
  return useAtomValue(limitOrdersDerivedStateAtom)
}

export function useFillLimitOrdersDerivedState() {
  const rawState = useAtomValue(limitOrdersRawStateAtom)
  const updateDerivedState = useSetAtom(limitOrdersDerivedStateAtom)

  const isUnlocked = rawState.isUnlocked
  const derivedState = useBuildTradeDerivedState(limitOrdersRawStateAtom)

  useEffect(() => {
    updateDerivedState({ ...derivedState, isUnlocked })
  }, [derivedState, updateDerivedState, isUnlocked])
}
