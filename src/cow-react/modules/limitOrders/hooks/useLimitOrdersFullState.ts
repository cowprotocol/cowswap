import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import {
  limitOrdersRawStateAtom,
  LimitOrdersFullState,
  limitOrdersFullStateAtom,
} from '@cow/modules/limitOrders/state/limitOrdersRawStateAtom'
import { useEffect } from 'react'
import { useBuildTradeFullState } from '@cow/modules/trade/hooks/useBuildTradeFullState'

export function useLimitOrdersFullState(): LimitOrdersFullState {
  return useAtomValue(limitOrdersFullStateAtom)
}

export function useFillLimitOrdersFullState() {
  const rawState = useAtomValue(limitOrdersRawStateAtom)
  const updateFullState = useUpdateAtom(limitOrdersFullStateAtom)

  const isUnlocked = rawState.isUnlocked
  const fullState = useBuildTradeFullState(limitOrdersRawStateAtom)

  useEffect(() => {
    updateFullState({ ...fullState, isUnlocked })
  }, [fullState, updateFullState, isUnlocked])
}
