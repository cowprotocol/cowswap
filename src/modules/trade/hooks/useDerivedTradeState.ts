import { useMemo } from 'react'
import { TradeType, useTradeTypeInfo } from './useTradeTypeInfo'
import { TradeDerivedState } from 'modules/trade/types/TradeDerivedState'
import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useSwapDerivedState } from 'modules/swap/state/useSwapDerivedState'

export function useDerivedTradeState(): { state?: TradeDerivedState } {
  const tradeTypeInfo = useTradeTypeInfo()

  const limitOrdersDerivedState = useLimitOrdersDerivedState()
  const advancedOrdersDerivedState = useAdvancedOrdersDerivedState()
  const swapDerivedState = useSwapDerivedState()

  return useMemo(() => {
    if (!tradeTypeInfo) return {}

    if (tradeTypeInfo.tradeType === TradeType.SWAP) {
      return {
        state: swapDerivedState,
      }
    }

    if (tradeTypeInfo.tradeType === TradeType.ADVANCED_ORDERS) {
      return {
        state: advancedOrdersDerivedState,
      }
    }

    return {
      state: limitOrdersDerivedState,
    }
  }, [tradeTypeInfo, swapDerivedState, limitOrdersDerivedState, advancedOrdersDerivedState])
}
