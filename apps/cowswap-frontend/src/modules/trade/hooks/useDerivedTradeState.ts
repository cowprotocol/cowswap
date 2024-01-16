import { useMemo } from 'react'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { useSwapDerivedState } from 'modules/swap/state/useSwapDerivedState'
import { TradeDerivedState } from 'modules/trade/types/TradeDerivedState'

import { TradeType, useTradeTypeInfo } from './useTradeTypeInfo'

export function useDerivedTradeState(): { state?: TradeDerivedState } {
  const tradeTypeInfo = useTradeTypeInfo()

  const limitOrdersDerivedState = useLimitOrdersDerivedState()
  const advancedOrdersDerivedState = useAdvancedOrdersDerivedState()
  const swapDerivedState = useSwapDerivedState()

  return useMemo(() => {
    if (!tradeTypeInfo) return {}

    if (tradeTypeInfo.tradeType === TradeType.SWAP) {
      return { state: swapDerivedState }
    }

    if (tradeTypeInfo.tradeType === TradeType.ADVANCED_ORDERS) {
      return { state: advancedOrdersDerivedState }
    }

    return { state: limitOrdersDerivedState }
  }, [tradeTypeInfo, swapDerivedState, limitOrdersDerivedState, advancedOrdersDerivedState])
}
