import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import {
  limitOrdersRawStateAtom,
  LimitOrdersDerivedState,
  limitOrdersDerivedStateAtom,
} from 'modules/limitOrders/state/limitOrdersRawStateAtom'
import { useEffect } from 'react'
import { useBuildTradeDerivedState } from 'modules/trade/hooks/useBuildTradeDerivedState'

export function useLimitOrdersDerivedState(): LimitOrdersDerivedState {
  return useAtomValue(limitOrdersDerivedStateAtom)
}

export function useFillLimitOrdersDerivedState() {
  const rawState = useAtomValue(limitOrdersRawStateAtom)
  const updateDerivedState = useUpdateAtom(limitOrdersDerivedStateAtom)

  const isUnlocked = rawState.isUnlocked
  const derivedState = useBuildTradeDerivedState(limitOrdersRawStateAtom)

  useEffect(() => {
    updateDerivedState({ ...derivedState, isUnlocked })
  }, [derivedState, updateDerivedState, isUnlocked])
}
