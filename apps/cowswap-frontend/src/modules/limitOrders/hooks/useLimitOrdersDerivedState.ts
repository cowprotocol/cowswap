import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import {
  DEFAULT_LIMIT_DERIVED_STATE,
  LimitOrdersDerivedState,
  limitOrdersDerivedStateAtom,
  limitOrdersRawStateAtom,
} from 'modules/limitOrders/state/limitOrdersRawStateAtom'
import { TradeType } from 'modules/trade'
import { useBuildTradeDerivedState } from 'modules/trade/hooks/useBuildTradeDerivedState'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { useIsWidgetUnlocked } from './useIsWidgetUnlocked'

import { LIMIT_ORDER_SLIPPAGE } from '../const/trade'

export function useLimitOrdersDerivedState(): LimitOrdersDerivedState {
  return useAtomValue(limitOrdersDerivedStateAtom)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useFillLimitOrdersDerivedState() {
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const updateDerivedState = useSetAtom(limitOrdersDerivedStateAtom)
  const isUnlocked = useIsWidgetUnlocked()
  const derivedState = useBuildTradeDerivedState(limitOrdersRawStateAtom, false)

  useEffect(() => {
    updateDerivedState(
      isProviderNetworkUnsupported
        ? DEFAULT_LIMIT_DERIVED_STATE
        : {
            ...derivedState,
            isUnlocked,
            slippage: LIMIT_ORDER_SLIPPAGE,
            tradeType: TradeType.LIMIT_ORDER,
          },
    )
  }, [derivedState, updateDerivedState, isUnlocked, isProviderNetworkUnsupported])
}
