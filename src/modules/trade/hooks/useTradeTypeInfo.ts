import { useMatch } from 'react-router-dom'
import { Routes } from 'constants/routes'
import { useMemo } from 'react'
import { PathMatch } from '@remix-run/router'

export enum TradeType {
  SWAP,
  LIMIT_ORDER,
  ADVANCED_ORDERS,
}

export interface TradeTypeInfo {
  tradeType: TradeType
  route: Routes
}

function useMatchTradeRoute(route: string): PathMatch<'chainId'> | null {
  const withChainId = useMatch({ path: `/:chainId/${route}/`, end: false })
  const withoutChainId = useMatch({ path: `/${route}/`, end: false })

  return withChainId || withoutChainId
}

export function useTradeTypeInfo(): TradeTypeInfo | null {
  const swapMatch = useMatchTradeRoute('swap')
  const limitOrderMatch = useMatchTradeRoute('limit-orders')
  const advancedOrdersMatch = useMatchTradeRoute('advanced-orders')

  return useMemo(() => {
    if (swapMatch) return { tradeType: TradeType.SWAP, route: Routes.SWAP }
    if (limitOrderMatch) return { tradeType: TradeType.LIMIT_ORDER, route: Routes.LIMIT_ORDER }
    if (advancedOrdersMatch) return { tradeType: TradeType.ADVANCED_ORDERS, route: Routes.ADVANCED_ORDERS }

    return null
  }, [swapMatch, limitOrderMatch, advancedOrdersMatch])
}
