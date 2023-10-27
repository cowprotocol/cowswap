import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'

import {
  LimitOrdersDerivedState,
  limitOrdersDerivedStateAtom,
  limitOrdersRawStateAtom,
} from 'modules/limitOrders/state/limitOrdersRawStateAtom'
import { TradeType } from 'modules/trade'
import { useBuildTradeDerivedState } from 'modules/trade/hooks/useBuildTradeDerivedState'

export function useLimitOrdersDerivedState(): LimitOrdersDerivedState {
  return useAtomValue(limitOrdersDerivedStateAtom)
}

export function useFillLimitOrdersDerivedState() {
  const rawState = useAtomValue(limitOrdersRawStateAtom)
  const updateDerivedState = useSetAtom(limitOrdersDerivedStateAtom)

  const isUnlocked = rawState.isUnlocked || isInjectedWidget()
  const derivedState = useBuildTradeDerivedState(limitOrdersRawStateAtom)

  useEffect(() => {
    updateDerivedState({ ...derivedState, isUnlocked, tradeType: TradeType.LIMIT_ORDER })
  }, [derivedState, updateDerivedState, isUnlocked])
}
