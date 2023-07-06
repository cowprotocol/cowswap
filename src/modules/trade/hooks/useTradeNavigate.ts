import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useLocation, useNavigate } from 'react-router-dom'

import { useTradeTypeInfo } from 'modules/trade/hooks/useTradeTypeInfo'
import { TradeCurrenciesIds } from 'modules/trade/types/TradeRawState'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'

interface UseTradeNavigateCallback {
  (chainId: SupportedChainId | null | undefined, { inputCurrencyId, outputCurrencyId }: TradeCurrenciesIds): void
}

export function useTradeNavigate(): UseTradeNavigateCallback {
  const navigate = useNavigate()
  const location = useLocation()
  const tradeTypeInfo = useTradeTypeInfo()
  const tradeRoute = tradeTypeInfo?.route

  return useCallback(
    (chainId: SupportedChainId | null | undefined, { inputCurrencyId, outputCurrencyId }: TradeCurrenciesIds) => {
      if (!tradeRoute) return

      const route = parameterizeTradeRoute(
        {
          chainId: chainId ? chainId.toString() : undefined,
          inputCurrencyId: inputCurrencyId || undefined,
          outputCurrencyId: outputCurrencyId || undefined,
        },
        tradeRoute
      )

      if (location.pathname === route) return

      navigate({ pathname: route, search: location.search })
    },
    [tradeRoute, navigate, location.pathname, location.search]
  )
}
