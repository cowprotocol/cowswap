import { useMemo } from 'react'

import { useTradeTypeInfo } from 'modules/trade'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { TradeType } from 'modules/trade/types'

const widgetTypeMap: Record<TradeType, string> = {
  [TradeType.SWAP]: 'SWAP',
  [TradeType.LIMIT_ORDER]: 'LIMIT',
  // TODO: set different type for other advanced orders
  [TradeType.ADVANCED_ORDERS]: 'TWAP',
  [TradeType.YIELD]: 'YIELD',
}

/**\
 *
 * Hook that returns "market" dimension in a form of
 * ${sellSymbol},${buySymbol}::${widgetType} or null
 *
 **/
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useGetMarketDimension() {
  const tradeTypeInfo = useTradeTypeInfo()
  const derivedTradeState = useDerivedTradeState()

  const sellSymbol = derivedTradeState?.inputCurrency?.symbol
  const buySymbol = derivedTradeState?.outputCurrency?.symbol
  const tradePair = sellSymbol && buySymbol ? `${sellSymbol},${buySymbol}` : null

  return useMemo(() => {
    if (!tradeTypeInfo || !tradePair) {
      return null
    }

    return `${tradePair}::${widgetTypeMap[tradeTypeInfo.tradeType]}`
  }, [tradePair, tradeTypeInfo])
}
