import { useEffect } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLocation } from 'react-router'

import type { RoutesValues } from 'common/constants/routes'
import { useNavigate } from 'common/hooks/useNavigate'

import { getDefaultTradeRawState } from '../types/TradeRawState'
import { parameterizeTradeRoute } from '../utils/parameterizeTradeRoute'

interface UseTradeRouteRedirectOptions {
  /** Used when both query ?inputCurrency= and getDefaultTradeRawState(...).inputCurrencyId are empty. */
  inputCurrencyFallback?: string
  defaultInputCurrencyId?: string
  defaultOutputCurrencyId?: string
  chainId?: SupportedChainId
  inputCurrencyId?: string
  outputCurrencyId?: string
}

export function useTradeRouteRedirect(
  route: RoutesValues,
  {
    inputCurrencyFallback,
    defaultInputCurrencyId,
    defaultOutputCurrencyId,
    chainId: routeChainId,
    inputCurrencyId: routeInputCurrencyId,
    outputCurrencyId: routeOutputCurrencyId,
  }: UseTradeRouteRedirectOptions = {},
): void {
  const { chainId: walletChainId } = useWalletInfo()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const chainId = routeChainId ?? walletChainId
    if (!chainId) return

    const defaultState = getDefaultTradeRawState(chainId)
    const searchParams = new URLSearchParams(location.search)
    const inputCurrencyId = getFirstCurrencyId(
      searchParams.get('inputCurrency'),
      routeInputCurrencyId,
      defaultInputCurrencyId,
      defaultState.inputCurrencyId,
      inputCurrencyFallback,
    )
    const outputCurrencyId = getFirstCurrencyId(
      searchParams.get('outputCurrency'),
      routeOutputCurrencyId,
      defaultOutputCurrencyId,
      defaultState.outputCurrencyId,
    )

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
  }, [
    walletChainId,
    routeChainId,
    routeInputCurrencyId,
    routeOutputCurrencyId,
    location.search,
    navigate,
    route,
    inputCurrencyFallback,
    defaultInputCurrencyId,
    defaultOutputCurrencyId,
  ])
}

function getFirstCurrencyId(...currencyIds: Array<string | null | undefined>): string | undefined {
  return currencyIds.find((currencyId): currencyId is string => Boolean(currencyId))
}
