import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { parameterizeLimitOrdersRoute } from 'cow-react/modules/limitOrders/hooks/useParameterizeLimitOrdersRoute'
import { useHistory } from 'react-router-dom'
import { useCallback } from 'react'

interface UseLimitOrdersNavigateCallback {
  (chainId: SupportedChainId | null | undefined, inputCurrencyId: string | null, outputCurrencyId: string | null): void
}

export function useLimitOrdersNavigate(): UseLimitOrdersNavigateCallback {
  const history = useHistory()

  return useCallback(
    (chainId: SupportedChainId | null | undefined, inputCurrencyId: string | null, outputCurrencyId: string | null) => {
      const route = parameterizeLimitOrdersRoute(chainId, inputCurrencyId, outputCurrencyId)

      history.push(route)
    },
    [history]
  )
}
