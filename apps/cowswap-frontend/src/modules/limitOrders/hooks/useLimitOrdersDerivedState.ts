import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import {
  LimitOrdersDerivedState,
  limitOrdersDerivedStateAtom,
  limitOrdersRawStateAtom,
} from 'modules/limitOrders/state/limitOrdersRawStateAtom'
import { TradeType } from 'modules/trade'
import { useBuildTradeDerivedState } from 'modules/trade/hooks/useBuildTradeDerivedState'

import { useIsWidgetUnlocked } from './useIsWidgetUnlocked'

import { LIMIT_ORDER_SLIPPAGE } from '../const/trade'

export function useLimitOrdersDerivedState(): LimitOrdersDerivedState {
  return useAtomValue(limitOrdersDerivedStateAtom)
}

export function useFillLimitOrdersDerivedState() {
  const updateDerivedState = useSetAtom(limitOrdersDerivedStateAtom)
  const isUnlocked = useIsWidgetUnlocked()
  const derivedState = useBuildTradeDerivedState(limitOrdersRawStateAtom)

  useEffect(() => {
    updateDerivedState({
      ...derivedState,
      isUnlocked,
      slippage: LIMIT_ORDER_SLIPPAGE,
      tradeType: TradeType.LIMIT_ORDER,
    })
  }, [derivedState, updateDerivedState, isUnlocked])
}
