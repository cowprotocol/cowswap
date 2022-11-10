import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useHistory, useLocation } from 'react-router-dom'
import { useCallback } from 'react'
import { useTradeTypeInfo } from '@cow/modules/trade/hooks/useTradeTypeInfo'
import { TradeCurrenciesIds } from '@cow/modules/trade/types/TradeState'
import { parameterizeTradeRoute } from '@cow/modules/trade/utils/parameterizeTradeRoute'
import { isSupportedChainId } from 'lib/hooks/routing/clientSideSmartOrderRouter'
import { useWeb3React } from '@web3-react/core'

interface UseTradeNavigateCallback {
  (chainId: SupportedChainId | null | undefined, { inputCurrencyId, outputCurrencyId }: TradeCurrenciesIds): void
}

export function useTradeNavigate(): UseTradeNavigateCallback {
  const history = useHistory()
  const location = useLocation()
  const tradeTypeInfo = useTradeTypeInfo()
  const { chainId: currentChainId } = useWeb3React()
  const tradeRoute = tradeTypeInfo?.route
  const isNetworkSupported = isSupportedChainId(currentChainId)
  // Currencies ids shouldn't be displayed in the URL when user selected unsupported network
  const fixCurrencyId = useCallback(
    (currencyId: string | null) => (isNetworkSupported ? currencyId || undefined : undefined),
    [isNetworkSupported]
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

      history.push(route + location.search)
    },
    [tradeRoute, history, location.search, fixCurrencyId]
  )
}
