import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useHistory } from 'react-router-dom'
import { useCallback } from 'react'
import { Routes } from '@cow/constants/routes'
import { parameterizeLimitOrdersRoute } from './useParameterizeTradeInMenu'

interface UseTradeNavigateCallback {
  (chainId: SupportedChainId | null | undefined, inputCurrencyId: string | null, outputCurrencyId: string | null): void
}

export function useTradeNavigate(baseRoute: Routes): UseTradeNavigateCallback {
  const history = useHistory()

  return useCallback(
    (chainId: SupportedChainId | null | undefined, inputCurrencyId: string | null, outputCurrencyId: string | null) => {
      const route = parameterizeLimitOrdersRoute(chainId, inputCurrencyId, outputCurrencyId, baseRoute)

      history.push(route)
    },
    [baseRoute, history]
  )
}
