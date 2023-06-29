import { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { useLocation, useNavigate } from 'react-router-dom'

import { useTradeTypeInfo } from 'modules/trade/hooks/useTradeTypeInfo'
import { TradeCurrenciesIds } from 'modules/trade/types/TradeRawState'
import { parameterizeTradeRoute } from 'modules/trade/utils/parameterizeTradeRoute'
import { useWalletInfo } from 'modules/wallet'

import { isSupportedChainId } from 'lib/hooks/routing/clientSideSmartOrderRouter'

interface UseTradeNavigateCallback {
  (chainId: SupportedChainId | null | undefined, { inputCurrencyId, outputCurrencyId }: TradeCurrenciesIds): void
}

export function useTradeNavigate(): UseTradeNavigateCallback {
  const navigate = useNavigate()
  const location = useLocation()
  const tradeTypeInfo = useTradeTypeInfo()
  const { chainId: currentChainId } = useWalletInfo()
  const tradeRoute = tradeTypeInfo?.route
  const isNetworkSupported = isSupportedChainId(currentChainId)
  // Currencies ids shouldn't be displayed in the URL when user selected unsupported network
  const fixCurrencyId = useCallback(
    (currencyId: string | null) => (isNetworkSupported || !currentChainId ? currencyId || undefined : undefined),
    [currentChainId, isNetworkSupported]
  )

  return useCallback(
    (chainId: SupportedChainId | null | undefined, { inputCurrencyId, outputCurrencyId }: TradeCurrenciesIds) => {
      if (!tradeRoute) return

      const route = parameterizeTradeRoute(
        {
          chainId: chainId ? chainId.toString() : undefined,
          inputCurrencyId: fixCurrencyId(inputCurrencyId),
          outputCurrencyId: fixCurrencyId(outputCurrencyId),
        },
        tradeRoute
      )

      if (location.pathname === route) return

      navigate({ pathname: route, search: location.search })
    },
    [tradeRoute, navigate, location.pathname, location.search, fixCurrencyId]
  )
}
