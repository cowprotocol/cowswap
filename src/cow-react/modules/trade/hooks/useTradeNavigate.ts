import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useHistory } from 'react-router-dom'
import { useCallback } from 'react'
import { parameterizeTradeRoute } from './useParameterizeTradeInMenu'
import { useTradeTypeInfo } from '@cow/modules/trade/hooks/useTradeTypeInfo'
import { TradeCurrenciesIds } from '@cow/modules/trade/types/TradeState'

interface UseTradeNavigateCallback {
  (chainId: SupportedChainId | null | undefined, { inputCurrencyId, outputCurrencyId }: TradeCurrenciesIds): void
}

export function useTradeNavigate(): UseTradeNavigateCallback {
  const history = useHistory()
  const tradeTypeInfo = useTradeTypeInfo()

  return useCallback(
    (chainId: SupportedChainId | null | undefined, { inputCurrencyId, outputCurrencyId }: TradeCurrenciesIds) => {
      if (!tradeTypeInfo) return

      const route = parameterizeTradeRoute(chainId, inputCurrencyId, outputCurrencyId, tradeTypeInfo.route)

      history.push(route)
    },
    [tradeTypeInfo, history]
  )
}
