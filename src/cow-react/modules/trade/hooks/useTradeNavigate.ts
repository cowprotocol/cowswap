import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useHistory } from 'react-router-dom'
import { useCallback } from 'react'
import { parameterizeLimitOrdersRoute } from './useParameterizeTradeInMenu'
import { useTradeTypeInfo } from '@cow/modules/trade/hooks/useTradeTypeInfo'

interface UseTradeNavigateCallback {
  (chainId: SupportedChainId | null | undefined, inputCurrencyId: string | null, outputCurrencyId: string | null): void
}

export function useTradeNavigate(): UseTradeNavigateCallback {
  const history = useHistory()
  const tradeTypeInfo = useTradeTypeInfo()

  return useCallback(
    (chainId: SupportedChainId | null | undefined, inputCurrencyId: string | null, outputCurrencyId: string | null) => {
      if (!tradeTypeInfo) return

      const route = parameterizeLimitOrdersRoute(chainId, inputCurrencyId, outputCurrencyId, tradeTypeInfo.route)

      history.push(route)
    },
    [tradeTypeInfo, history]
  )
}
