import { matchPath, useLocation } from 'react-router-dom'
import { Routes } from '@cow/constants/routes'
import { match } from 'react-router'
import { TradeStateFromUrl } from '@cow/modules/trade/types/TradeState'

export enum TradeType {
  SWAP,
  LIMIT_ORDER,
}

export function useTradeType(): { type: TradeType | null; match: match<TradeStateFromUrl> | null } {
  const location = useLocation()

  const swapMatch = matchPath<TradeStateFromUrl>(location.pathname, Routes.SWAP)
  const limitOrderMatch = matchPath<TradeStateFromUrl>(location.pathname, Routes.LIMIT_ORDER)

  return {
    type: swapMatch ? TradeType.SWAP : limitOrderMatch ? TradeType.LIMIT_ORDER : null,
    match: swapMatch || limitOrderMatch,
  }
}
