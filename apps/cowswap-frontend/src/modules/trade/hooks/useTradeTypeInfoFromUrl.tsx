import { useMemo } from 'react'

import { PathMatch } from '@remix-run/router'
import { useMatch } from 'react-router-dom'

import { Routes, TRADE_WIDGET_PREFIX } from 'common/constants/routes'

import { TradeType, TradeTypeInfo } from '../types'

export function useTradeTypeInfoFromUrl(): TradeTypeInfo | null {
  const swapMatch = !!useMatchTradeRoute('swap')
  const hooksMatch = !!useMatchTradeRoute('swap/hooks')
  const limitOrderMatch = !!useMatchTradeRoute('limit')
  const advancedOrdersMatch = !!useMatchTradeRoute('advanced')

  return useMemo(() => {
    if (hooksMatch) return { tradeType: TradeType.SWAP, route: Routes.HOOKS }
    if (swapMatch) return { tradeType: TradeType.SWAP, route: Routes.SWAP }
    if (limitOrderMatch) return { tradeType: TradeType.LIMIT_ORDER, route: Routes.LIMIT_ORDER }
    if (advancedOrdersMatch) return { tradeType: TradeType.ADVANCED_ORDERS, route: Routes.ADVANCED_ORDERS }

    return null
  }, [swapMatch, limitOrderMatch, advancedOrdersMatch])
}

function useMatchTradeRoute(route: string): PathMatch<'chainId'> | null {
  const withChainId = useMatch({ path: `/:chainId${TRADE_WIDGET_PREFIX}/${route}/`, end: false })
  const withoutChainId = useMatch({ path: `${TRADE_WIDGET_PREFIX}/${route}/`, end: false })

  return withChainId || withoutChainId
}
