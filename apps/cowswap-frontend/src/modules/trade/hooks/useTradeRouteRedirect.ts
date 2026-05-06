import { useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useLocation } from 'react-router'

import type { RoutesValues } from 'common/constants/routes'
import { useNavigate } from 'common/hooks/useNavigate'

import { getDefaultTradeRawState } from '../utils/getDefaultTradeRawState'
import { parameterizeTradeRoute } from '../utils/parameterizeTradeRoute'

interface UseTradeRouteRedirectOptions {
  /** Used when both query ?inputCurrency= and getDefaultTradeRawState(...).inputCurrencyId are empty. */
  inputCurrencyFallback?: string
}

export function useTradeRouteRedirect(
  route: RoutesValues,
  { inputCurrencyFallback }: UseTradeRouteRedirectOptions = {},
): void {
  const { chainId } = useWalletInfo()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!chainId) return

    const defaultState = getDefaultTradeRawState(chainId)
    const searchParams = new URLSearchParams(location.search)
    const inputCurrencyId =
      searchParams.get('inputCurrency') || defaultState.inputCurrencyId || inputCurrencyFallback || undefined
    const outputCurrencyId = searchParams.get('outputCurrency') || defaultState.outputCurrencyId || undefined

    searchParams.delete('inputCurrency')
    searchParams.delete('outputCurrency')
    searchParams.delete('chain')

    const pathname = parameterizeTradeRoute(
      {
        chainId: String(chainId),
        inputCurrencyId,
        outputCurrencyId,
        inputCurrencyAmount: undefined,
        outputCurrencyAmount: undefined,
        orderKind: undefined,
      },
      route,
    )

    navigate({ pathname, search: searchParams.toString() }, { replace: true })
  }, [chainId, location.search, navigate, route, inputCurrencyFallback])
}
