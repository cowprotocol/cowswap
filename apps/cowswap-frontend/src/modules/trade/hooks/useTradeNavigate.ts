import { useCallback, useRef } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLocation } from 'react-router'

import { RoutesValues } from 'common/constants/routes'
import { useNavigate } from 'common/hooks/useNavigate'

import { useTradeTypeInfo } from './useTradeTypeInfo'

import { TradeCurrenciesIds } from '../types/TradeRawState'
import { parameterizeTradeRoute } from '../utils/parameterizeTradeRoute'
import { parameterizeTradeSearch, TradeSearchParams } from '../utils/parameterizeTradeSearch'

// Debounce time to prevent rapid chainId flipping in URL
const NAVIGATION_DEBOUNCE_MS = 300

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
  const { chainId: providerChainId } = useWalletInfo()
  const tradeRoute = tradeTypeInfo?.route

  // Use a ref to keep track of the latest navigation timer
  const navigationTimerRef = useRef<number | null>(null)

  return useCallback(
    (
      chainId: SupportedChainId | null | undefined,
      { inputCurrencyId, outputCurrencyId }: TradeCurrenciesIds,
      searchParams?: TradeSearchParams,
      customRoute?: RoutesValues,
    ) => {
      const targetRoute = customRoute || tradeRoute
      if (!targetRoute) return

      // ALWAYS prioritize provider's chainId when available
      // This ensures the chainId in URL always matches the network the wallet is connected to
      const effectiveChainId = providerChainId || chainId

      const route = parameterizeTradeRoute(
        {
          chainId: effectiveChainId ? effectiveChainId.toString() : undefined,
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

      // Clear any existing navigation timer
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current)
      }

      // Create a new debounced navigation to prevent URL flipping
      // This ensures we only navigate after things have settled, making URL updates more stable
      navigationTimerRef.current = window.setTimeout(() => {
        navigate({ pathname: route, search })
        console.debug('[TRADE NAVIGATE] Navigating to:', route)
        navigationTimerRef.current = null
      }, NAVIGATION_DEBOUNCE_MS)
    },
    [tradeRoute, navigate, location.pathname, location.search, providerChainId],
  )
}
