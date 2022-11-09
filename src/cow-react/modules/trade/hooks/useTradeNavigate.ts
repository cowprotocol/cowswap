import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useHistory, useLocation } from 'react-router-dom'
import { useCallback } from 'react'
import { useTradeTypeInfo } from '@cow/modules/trade/hooks/useTradeTypeInfo'
import { TradeCurrenciesIds } from '@cow/modules/trade/types/TradeState'
import { parameterizeTradeRoute } from '@cow/modules/trade/utils/parameterizeTradeRoute'

interface UseTradeNavigateCallback {
  (chainId: SupportedChainId | null | undefined, { inputCurrencyId, outputCurrencyId }: TradeCurrenciesIds): void
}

export function useTradeNavigate(): UseTradeNavigateCallback {
  const history = useHistory()
  const location = useLocation()
  const tradeTypeInfo = useTradeTypeInfo()

  return useCallback(
    (chainId: SupportedChainId | null | undefined, { inputCurrencyId, outputCurrencyId }: TradeCurrenciesIds) => {
      if (!tradeTypeInfo) return

      const route = parameterizeTradeRoute(
        {
          chainId: chainId ? chainId.toString() : undefined,
          inputCurrencyId: inputCurrencyId || undefined,
          outputCurrencyId: outputCurrencyId || undefined,
        },
        tradeTypeInfo.route
      )

      history.push(route + location.search)
    },
    [tradeTypeInfo, history, location]
  )
}
