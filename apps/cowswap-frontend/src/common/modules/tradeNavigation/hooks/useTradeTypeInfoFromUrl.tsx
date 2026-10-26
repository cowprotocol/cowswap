import { useLocation } from 'react-router'

import { Routes, TRADE_WIDGET_PREFIX } from 'common/constants/routes'

import { TradeType } from '../consts'
import { TradeTypeInfo } from '../types'

const TRADE_TYPE_INFO_BY_SEGMENT: Record<string, TradeTypeInfo> = {
  'swap/hooks': { tradeType: TradeType.SWAP, route: Routes.HOOKS },
  swap: { tradeType: TradeType.SWAP, route: Routes.SWAP },
  limit: { tradeType: TradeType.LIMIT_ORDER, route: Routes.LIMIT_ORDERS },
  advanced: { tradeType: TradeType.ADVANCED_ORDERS, route: Routes.ADVANCED_ORDERS },
  yield: { tradeType: TradeType.YIELD, route: Routes.YIELD },
}

// The chainId segment is lazy (`??`) so `/swap/limit` resolves to swap rather than reading `swap` as a chainId.
// `swap/hooks` precedes `swap` so the longer route wins. Case-insensitive like react-router's own matching.
const TRADE_ROUTE_REGEX = new RegExp(
  `^(?:/[^/]+)??${TRADE_WIDGET_PREFIX}/(swap/hooks|swap|limit|advanced|yield)(?:/|$)`,
  'i',
)

export function useTradeTypeInfoFromUrl(): TradeTypeInfo | null {
  const { pathname } = useLocation()
  const segment = TRADE_ROUTE_REGEX.exec(pathname)?.[1]

  return segment ? (TRADE_TYPE_INFO_BY_SEGMENT[segment.toLowerCase()] ?? null) : null
}
