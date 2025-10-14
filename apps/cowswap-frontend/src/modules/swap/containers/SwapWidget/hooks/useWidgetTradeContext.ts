import { useMemo } from 'react'

import { useWrapNativeFlow } from 'modules/trade'
import { useHandleSwap } from 'modules/tradeFlow'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

import { useHasEnoughWrappedBalanceForSwap } from '../../../hooks/useHasEnoughWrappedBalanceForSwap'
import { useSwapDerivedState } from '../../../hooks/useSwapDerivedState'
import { useSwapDeadlineState } from '../../../hooks/useSwapSettings'
import { useSwapWidgetActions } from '../../../hooks/useSwapWidgetActions'
import { useUpdateSwapRawState } from '../../../hooks/useUpdateSwapRawState'

export interface TradeContext {
  wrapCallback: ReturnType<typeof useWrapNativeFlow>
  updateSwapState: ReturnType<typeof useUpdateSwapRawState>
  derivedState: ReturnType<typeof useSwapDerivedState>
  doTrade: ReturnType<typeof useHandleSwap>
  hasEnoughWrappedBalanceForSwap: boolean
}

export function useTradeContext(
  deadlineState: ReturnType<typeof useSwapDeadlineState>,
  widgetActions: ReturnType<typeof useSwapWidgetActions>,
): TradeContext {
  const wrapCallback = useWrapNativeFlow()
  const updateSwapState = useUpdateSwapRawState()
  const derivedState = useSwapDerivedState()
  const doTrade = useHandleSwap(useSafeMemoObject({ deadline: deadlineState[0] }), widgetActions)
  const hasEnoughWrappedBalanceForSwap = useHasEnoughWrappedBalanceForSwap()

  return useMemo(
    () => ({ wrapCallback, updateSwapState, derivedState, doTrade, hasEnoughWrappedBalanceForSwap }),
    [wrapCallback, updateSwapState, derivedState, doTrade, hasEnoughWrappedBalanceForSwap],
  )
}
