import { type ReactNode } from 'react'

import type { RoutesValues } from 'common/constants/routes'

import { useTradeRouteRedirect } from '../hooks/useTradeRouteRedirect'

interface TradeRouteRedirectProps {
  route: RoutesValues
  inputCurrencyFallback?: string
}

export function TradeRouteRedirect({ route, inputCurrencyFallback }: TradeRouteRedirectProps): ReactNode {
  useTradeRouteRedirect(route, { inputCurrencyFallback })
  return null
}
