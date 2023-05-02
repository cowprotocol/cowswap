import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import {
  limitOrdersAtom,
  LimitOrdersFullState,
  limitOrdersFullStateAtom,
} from '@cow/modules/limitOrders/state/limitOrdersAtom'
import { useEffect } from 'react'
import { useBuildTradeFullState } from '@cow/modules/trade/hooks/useBuildTradeFullState'

export function useLimitOrdersFullState(): LimitOrdersFullState {
  return useAtomValue(limitOrdersFullStateAtom)
}

export function useFillLimitOrdersFullState() {
  const rawState = useAtomValue(limitOrdersAtom)
  const updateFullState = useUpdateAtom(limitOrdersFullStateAtom)

  const isUnlocked = rawState.isUnlocked
  const fullState = useBuildTradeFullState(limitOrdersAtom)

  useEffect(() => {
    updateFullState({ ...fullState, isUnlocked })
  }, [fullState, updateFullState, isUnlocked])
}
