import { matchPath, useLocation } from 'react-router-dom'
import { Routes } from '@cow/constants/routes'
import { match } from 'react-router'
import { TradeStateFromUrl } from '@cow/modules/trade/types/TradeState'
import { useMemo } from 'react'

export enum TradeType {
  SWAP,
  LIMIT_ORDER,
}

export interface TradeTypeInfo {
  tradeType: TradeType
  route: Routes
  match: match<TradeStateFromUrl>
}

export function useTradeTypeInfo(): TradeTypeInfo | null {
  const location = useLocation()

  const [swapMatch, limitOrderMatch] = useMemo(() => {
    return [
      matchPath<TradeStateFromUrl>(location.pathname, Routes.SWAP),
      matchPath<TradeStateFromUrl>(location.pathname, Routes.LIMIT_ORDER),
    ]
  }, [location.pathname])

  return useMemo(() => {
    if (!swapMatch && !limitOrderMatch) return null

    return {
      tradeType: swapMatch ? TradeType.SWAP : TradeType.LIMIT_ORDER,
      route: swapMatch ? Routes.SWAP : Routes.LIMIT_ORDER,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      match: (swapMatch || limitOrderMatch)!,
    }
  }, [swapMatch, limitOrderMatch])
}
