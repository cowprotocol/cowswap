import { useCallback, useRef } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLocation } from 'react-router'

import { Routes, RoutesValues } from 'common/constants/routes'
import { useNavigate } from 'common/hooks/useNavigate'

import { useTradeTypeInfo } from './useTradeTypeInfo'

import { TradeCurrenciesIds } from '../types/TradeRawState'
import { parameterizeTradeRoute } from '../utils/parameterizeTradeRoute'
import { parameterizeTradeSearch, TradeSearchParams } from '../utils/parameterizeTradeSearch'

// Debounce time for TWAP navigation to prevent rapid chainId flipping in URL
const TWAP_NAVIGATION_DEBOUNCE_MS = 200

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

  // For TWAP mode: use a ref to track navigation debouncing
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  return useCallback(
    (
      chainId: SupportedChainId | null | undefined,
      { inputCurrencyId, outputCurrencyId }: TradeCurrenciesIds,
      searchParams?: TradeSearchParams,
      customRoute?: RoutesValues,
    ) => {
      const targetRoute = customRoute || tradeRoute
      if (!targetRoute) return

      // For TWAP (Advanced Orders) mode, always use provider's chainId if available
      // This ensures the chainId in URL always matches the network the wallet is connected to
      const isTwapMode = targetRoute === Routes.ADVANCED_ORDERS
      const effectiveChainId = isTwapMode && providerChainId ? providerChainId : chainId

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

      if (location.pathname === route) return

      const search = parameterizeTradeSearch(location.search, searchParams)

      // For TWAP mode, use debouncing to prevent chain ID flipping
      if (isTwapMode) {
        // Clear any pending navigation
        if (navigationTimeoutRef.current) {
          clearTimeout(navigationTimeoutRef.current)
        }

        // Schedule the navigation with a delay
        navigationTimeoutRef.current = setTimeout(() => {
          navigate({ pathname: route, search })
        }, TWAP_NAVIGATION_DEBOUNCE_MS)
      } else {
        // For non-TWAP modes, navigate immediately
        navigate({ pathname: route, search })
      }
    },
    [tradeRoute, navigate, location.pathname, location.search, providerChainId],
  )
}
