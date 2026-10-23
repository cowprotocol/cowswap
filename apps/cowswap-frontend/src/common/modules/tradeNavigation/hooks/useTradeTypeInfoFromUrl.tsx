import { useMemo } from 'react'

import { PathMatch, PathPattern, useMatch } from 'react-router'

import { Routes, TRADE_WIDGET_PREFIX } from 'common/constants/routes'

import { TradeType } from '../consts'
import { TradeTypeInfo } from '../types'

interface TradeRoutePatterns {
  withChainId: PathPattern
  withoutChainId: PathPattern
}

function getTradeRoutePatterns(route: string): TradeRoutePatterns {
  return {
    withChainId: { path: `/:chainId${TRADE_WIDGET_PREFIX}/${route}/`, end: false },
    withoutChainId: { path: `${TRADE_WIDGET_PREFIX}/${route}/`, end: false },
  }
}

// Module-level so `useMatch` gets the same pattern objects every render: it memoizes on them, and a fresh pattern
// recompiles the route regex on each call.
const SWAP_PATTERNS = getTradeRoutePatterns('swap')
const HOOKS_PATTERNS = getTradeRoutePatterns('swap/hooks')
const LIMIT_PATTERNS = getTradeRoutePatterns('limit')
const ADVANCED_PATTERNS = getTradeRoutePatterns('advanced')
const YIELD_PATTERNS = getTradeRoutePatterns('yield')

export function useTradeTypeInfoFromUrl(): TradeTypeInfo | null {
  const swapMatch = !!useMatchTradeRoute(SWAP_PATTERNS)
  const hooksMatch = !!useMatchTradeRoute(HOOKS_PATTERNS)
  const limitOrderMatch = !!useMatchTradeRoute(LIMIT_PATTERNS)
  const advancedOrdersMatch = !!useMatchTradeRoute(ADVANCED_PATTERNS)
  const yieldMatch = !!useMatchTradeRoute(YIELD_PATTERNS)

  return useMemo(() => {
    if (hooksMatch) return { tradeType: TradeType.SWAP, route: Routes.HOOKS }
    if (swapMatch) return { tradeType: TradeType.SWAP, route: Routes.SWAP }
    if (limitOrderMatch) return { tradeType: TradeType.LIMIT_ORDER, route: Routes.LIMIT_ORDERS }
    if (advancedOrdersMatch) return { tradeType: TradeType.ADVANCED_ORDERS, route: Routes.ADVANCED_ORDERS }
    if (yieldMatch) return { tradeType: TradeType.YIELD, route: Routes.YIELD }

    return null
  }, [swapMatch, hooksMatch, limitOrderMatch, advancedOrdersMatch, yieldMatch])
}

function useMatchTradeRoute(patterns: TradeRoutePatterns): PathMatch<string> | null {
  const withChainId = useMatch(patterns.withChainId)
  const withoutChainId = useMatch(patterns.withoutChainId)

  return withChainId || withoutChainId
}
