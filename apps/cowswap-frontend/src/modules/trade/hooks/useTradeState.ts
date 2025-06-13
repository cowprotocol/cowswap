import { useCallback, useMemo } from 'react'

import {
  useAdvancedOrdersRawState,
  useUpdateAdvancedOrdersRawState,
} from 'modules/advancedOrders/hooks/useAdvancedOrdersRawState'
import { useLimitOrdersRawState, useUpdateLimitOrdersRawState } from 'modules/limitOrders/hooks/useLimitOrdersRawState'
import { useSwapRawState } from 'modules/swap/hooks/useSwapRawState'
import { useUpdateSwapRawState } from 'modules/swap/hooks/useUpdateSwapRawState'
import { ExtendedTradeRawState } from 'modules/trade/types/TradeRawState'
import { useUpdateYieldRawState, useYieldRawState } from 'modules/yield'

import { Routes, RoutesValues } from 'common/constants/routes'

import { useTradeTypeInfoFromUrl } from './useTradeTypeInfoFromUrl'

import { TradeType } from '../types'

const EMPTY_TRADE_STATE = {}

export function useTradeState(): {
  state?: ExtendedTradeRawState
  updateState?: (update: Partial<ExtendedTradeRawState>) => void
} {
  const tradeTypeInfo = useTradeTypeInfoFromUrl()

  const limitOrdersState = useLimitOrdersRawState()
  const updateLimitOrdersState = useUpdateLimitOrdersRawState()

  const advancedOrdersState = useAdvancedOrdersRawState()
  const updateAdvancedOrdersState = useUpdateAdvancedOrdersRawState()

  const swapTradeState = useSwapRawState()
  const updateSwapState = useUpdateSwapRawState()

  const yieldRawState = useYieldRawState()
  const updateYieldRawState = useUpdateYieldRawState()

  return useMemo(() => {
    if (!tradeTypeInfo) return EMPTY_TRADE_STATE

    if (tradeTypeInfo.tradeType === TradeType.SWAP) {
      return {
        state: swapTradeState,
        updateState: updateSwapState,
      }
    }

    if (tradeTypeInfo.tradeType === TradeType.ADVANCED_ORDERS) {
      return {
        state: advancedOrdersState,
        updateState: updateAdvancedOrdersState,
      }
    }

    if (tradeTypeInfo.tradeType === TradeType.YIELD) {
      return {
        state: yieldRawState,
        updateState: updateYieldRawState,
      }
    }

    return {
      state: limitOrdersState,
      updateState: updateLimitOrdersState,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(tradeTypeInfo),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(limitOrdersState),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(advancedOrdersState),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(swapTradeState),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(yieldRawState),
    updateSwapState,
    updateLimitOrdersState,
    updateYieldRawState,
  ])
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useGetTradeStateByRoute() {
  const limitOrdersState = useLimitOrdersRawState()
  const advancedOrdersState = useAdvancedOrdersRawState()
  const swapTradeState = useSwapRawState()
  const yieldRawState = useYieldRawState()

  return useCallback(
    (route: RoutesValues) => {
      if (route === Routes.SWAP || route === Routes.HOOKS) return swapTradeState
      if (route === Routes.ABOUT) return advancedOrdersState
      if (route === Routes.YIELD) return yieldRawState
      return limitOrdersState
    },
    [swapTradeState, advancedOrdersState, yieldRawState, limitOrdersState],
  )
}
