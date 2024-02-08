import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useLocation, useNavigate } from 'react-router-dom'

import { RoutesValues } from 'common/constants/routes'

import { useTradeTypeInfo } from './useTradeTypeInfo'

import { TradeCurrenciesIds } from '../types/TradeRawState'
import { parameterizeTradeRoute } from '../utils/parameterizeTradeRoute'
import { parameterizeTradeSearch, TradeSearchParams } from '../utils/parameterizeTradeSearch'

type UseTradeNavigateCallback = (
  /**
   * The optional chainId to switch to
   */
  chainId: SupportedChainId | null | undefined,
  /**
   * The optional input/output currency ids (symbol or address)
   */
  { inputCurrencyId, outputCurrencyId }: TradeCurrenciesIds,
  /**
   * The optional trade amount and kind
   */
  searchParams?: TradeSearchParams,
  /**
   * The optional new trade route
   * When not provided, the current route will be kept
   */
  newTradeRoute?: RoutesValues
) => void

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
      newTradeRoute?: RoutesValues
    ) => {
      if (!tradeRoute || !newTradeRoute) return

      const route = parameterizeTradeRoute(
        {
          chainId: chainId ? chainId.toString() : undefined,
          inputCurrencyId: inputCurrencyId || undefined,
          outputCurrencyId: outputCurrencyId || undefined,
        },
        newTradeRoute || tradeRoute
      )

      if (location.pathname === route) return

      const search = parameterizeTradeSearch(location.search, searchParams)

      navigate({ pathname: route, search })
    },
    [tradeRoute, navigate, location.pathname, location.search]
  )
}
