import { useMatch } from 'react-router-dom'
import { Routes } from '@cow/constants/routes'
import { useMemo } from 'react'

export enum TradeType {
  SWAP,
  LIMIT_ORDER,
}

export interface TradeTypeInfo {
  tradeType: TradeType
  route: Routes
}

export function useTradeTypeInfo(): TradeTypeInfo | null {
  const swapMatchWithChainId = useMatch({ path: '/:chainId/swap/', end: false })
  const swapMatchWithoutChainId = useMatch({ path: '/swap/', end: false })
  const limitOrderMatchWithChainId = useMatch({ path: '/:chainId/limit-orders/', end: false })
  const limitOrderMatchWithoutChainId = useMatch({ path: '/limit-orders/', end: false })

  const swapMatch = swapMatchWithChainId || swapMatchWithoutChainId
  const limitOrderMatch = limitOrderMatchWithChainId || limitOrderMatchWithoutChainId

  return useMemo(() => {
    if (!swapMatch && !limitOrderMatch) return null

    return {
      tradeType: swapMatch ? TradeType.SWAP : TradeType.LIMIT_ORDER,
      route: swapMatch ? Routes.SWAP : Routes.LIMIT_ORDER,
    }
  }, [swapMatch, limitOrderMatch])
}
