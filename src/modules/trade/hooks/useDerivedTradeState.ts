import { useMemo } from 'react'
import { TradeType, useTradeTypeInfo } from './useTradeTypeInfo'
import { TradeDerivedState } from 'modules/trade/types/TradeDerivedState'
import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { DEFAULT_TRADE_DERIVED_STATE } from 'modules/trade/types/TradeDerivedState'

export function useDerivedTradeState(): { state: TradeDerivedState } {
  const tradeTypeInfo = useTradeTypeInfo()

  const limitOrdersDerivedState = useLimitOrdersDerivedState()
  const advancedOrdersDerivedState = useAdvancedOrdersDerivedState()

  return useMemo(() => {
    if (!tradeTypeInfo)
      return {
        state: DEFAULT_TRADE_DERIVED_STATE,
      }

    // TODO: implement SWAP also

    if (tradeTypeInfo.tradeType === TradeType.ADVANCED_ORDERS) {
      return {
        state: advancedOrdersDerivedState,
      }
    }

    return {
      state: limitOrdersDerivedState,
    }
  }, [tradeTypeInfo, limitOrdersDerivedState, advancedOrdersDerivedState])
}
