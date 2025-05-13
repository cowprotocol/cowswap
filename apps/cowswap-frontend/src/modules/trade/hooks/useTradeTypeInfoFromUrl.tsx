import { useMemo } from 'react'

import { PathMatch, useMatch } from 'react-router'

import { Routes, TRADE_WIDGET_PREFIX } from 'common/constants/routes'

import { TradeType, TradeTypeInfo } from '../types'

export function useTradeTypeInfoFromUrl(): TradeTypeInfo | null {
  const swapMatch = !!useMatchTradeRoute('swap')
  const hooksMatch = !!useMatchTradeRoute('swap/hooks')
  const limitOrderMatch = !!useMatchTradeRoute('limit')
  const advancedOrdersMatch = !!useMatchTradeRoute('advanced')
  const yieldMatch = !!useMatchTradeRoute('yield')

  return useMemo(() => {
    if (hooksMatch) return { tradeType: TradeType.SWAP, route: Routes.HOOKS }
    if (swapMatch) return { tradeType: TradeType.SWAP, route: Routes.SWAP }
    if (limitOrderMatch) return { tradeType: TradeType.LIMIT_ORDER, route: Routes.LIMIT_ORDER }
    if (advancedOrdersMatch) return { tradeType: TradeType.ADVANCED_ORDERS, route: Routes.ADVANCED_ORDERS }
    if (yieldMatch) return { tradeType: TradeType.YIELD, route: Routes.YIELD }

    return null
  }, [swapMatch, hooksMatch, limitOrderMatch, advancedOrdersMatch, yieldMatch])
}

function useMatchTradeRoute(route: string): PathMatch<'chainId'> | null {
  const withChainId = useMatch({ path: `/:chainId${TRADE_WIDGET_PREFIX}/${route}/`, end: false })
  const withoutChainId = useMatch({ path: `${TRADE_WIDGET_PREFIX}/${route}/`, end: false })

  return withChainId || withoutChainId
}
