import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useLocation } from 'react-router'

import { RoutesValues } from 'common/constants/routes'
import { useNavigate } from 'common/hooks/useNavigate'

import { useTradeTypeInfo } from './useTradeTypeInfo'

import { TradeCurrenciesIds } from '../types/TradeRawState'
import { parameterizeTradeRoute } from '../utils/parameterizeTradeRoute'
import { parameterizeTradeSearch, TradeSearchParams } from '../utils/parameterizeTradeSearch'

interface UseTradeNavigateCallback {
  (
    chainId: SupportedChainId | null | undefined,
    { inputCurrencyId, outputCurrencyId }: TradeCurrenciesIds,
    searchParams?: TradeSearchParams,
    customRoute?: RoutesValues,
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
      searchParams?: TradeSearchParams,
      customRoute?: RoutesValues,
    ) => {
      const targetRoute = customRoute || tradeRoute
      if (!targetRoute) return

      const route = parameterizeTradeRoute(
        {
          chainId: chainId ? chainId.toString() : undefined,
          inputCurrencyId: inputCurrencyId || undefined,
          outputCurrencyId: outputCurrencyId || undefined,
          inputCurrencyAmount: undefined,
          outputCurrencyAmount: undefined,
          orderKind: undefined,
        },
        targetRoute,
      )

      const search = parameterizeTradeSearch(location.search, searchParams)

      // Don't navigate if we're already on this route
      if (location.pathname === route && location.search.slice(1) === search) return

      navigate({ pathname: route, search })
    },
    [tradeRoute, navigate, location.pathname, location.search],
  )
}
