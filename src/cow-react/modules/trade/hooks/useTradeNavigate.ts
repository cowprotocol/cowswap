import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useHistory } from 'react-router-dom'
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
  const tradeTypeInfo = useTradeTypeInfo()
  const { chainId: currentChainId } = useWeb3React()

  return useCallback(
    (chainId: SupportedChainId | null | undefined, { inputCurrencyId, outputCurrencyId }: TradeCurrenciesIds) => {
      if (!tradeTypeInfo) return

      const isNetworkSupported = isSupportedChainId(currentChainId)
      // Currencies ids shouldn't be displayed in the URL when user selected unsupported network
      const fixCurrencyId = (currencyId: string | null) => (isNetworkSupported ? currencyId || undefined : undefined)

      const route = parameterizeTradeRoute(
        {
          chainId: chainId ? chainId.toString() : undefined,
          inputCurrencyId: fixCurrencyId(inputCurrencyId),
          outputCurrencyId: fixCurrencyId(outputCurrencyId),
        },
        tradeTypeInfo.route
      )

      history.push(route)
    },
    [tradeTypeInfo, history, currentChainId]
  )
}
