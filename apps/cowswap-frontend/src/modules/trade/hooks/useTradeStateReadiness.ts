import { useMemo } from 'react'

import { useTradeState } from './useTradeState'
import { useTradeTypeInfoFromUrl } from './useTradeTypeInfoFromUrl'

export interface TradeStateReadiness {
  isReady: boolean
  isLoading: boolean
}

export function useTradeStateReadiness(): TradeStateReadiness {
  const tradeTypeInfo = useTradeTypeInfoFromUrl()
  const { state } = useTradeState()

  return useMemo(() => {
    const hasTradeTypeInfo = tradeTypeInfo !== null
    const hasTradeState = state !== undefined

    const isReady = hasTradeTypeInfo && hasTradeState
    const isLoading = !isReady

    return {
      isReady,
      isLoading,
    }
  }, [tradeTypeInfo, state])
}
