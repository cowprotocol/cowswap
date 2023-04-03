import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCallback } from 'react'
import { useTradeTypeInfo } from '@cow/modules/trade/hooks/useTradeTypeInfo'
import { TradeCurrenciesIds } from '@cow/modules/trade/types/TradeState'
import { parameterizeTradeRoute } from '@cow/modules/trade/utils/parameterizeTradeRoute'
import { isSupportedChainId } from 'lib/hooks/routing/clientSideSmartOrderRouter'
import { useWalletInfo } from '@cow/modules/wallet'

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
