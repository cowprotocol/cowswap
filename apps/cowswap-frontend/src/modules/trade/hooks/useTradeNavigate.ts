import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useLocation, useNavigate } from 'react-router-dom'

import { useTradeTypeInfo } from './useTradeTypeInfo'

import { TradeCurrenciesIds } from '../types/TradeRawState'
import { parameterizeTradeRoute } from '../utils/parameterizeTradeRoute'
import { parameterizeTradeSearch, TradeSearchParams } from '../utils/parameterizeTradeSearch'

interface UseTradeNavigateCallback {
  (
    chainId: SupportedChainId | null | undefined,
    { inputCurrencyId, outputCurrencyId }: TradeCurrenciesIds,
    searchParams?: TradeSearchParams
  ): void
}

export function useTradeNavigate(): UseTradeNavigateCallback {
  const navigate = useNavigate()
  const location = useLocation()
  const tradeTypeInfo = useTradeTypeInfo()
  const tradeRoute = tradeTypeInfo?.route

  return useCallback(
    (
      chainId: SupportedChainId | null | undefined,
      { inputCurrencyId, outputCurrencyId }: TradeCurrenciesIds,
      searchParams?: TradeSearchParams
    ) => {
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

      const search = parameterizeTradeSearch(location.search, searchParams)

      navigate({ pathname: route, search })
    },
    [tradeRoute, navigate, location.pathname, location.search]
  )
}
