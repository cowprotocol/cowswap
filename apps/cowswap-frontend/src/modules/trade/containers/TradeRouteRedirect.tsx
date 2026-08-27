import { type ReactNode } from 'react'

import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import type { RoutesValues } from 'common/constants/routes'

import { useTradeRouteRedirect } from '../hooks/useTradeRouteRedirect'

interface TradeRouteRedirectProps {
  route: RoutesValues
  inputCurrencyFallback?: string
  defaultInputCurrencyId?: string
  defaultOutputCurrencyId?: string
  chainId?: SupportedChainId
  inputCurrencyId?: string
  outputCurrencyId?: string
}

export function TradeRouteRedirect({
  route,
  inputCurrencyFallback,
  defaultInputCurrencyId,
  defaultOutputCurrencyId,
  chainId,
  inputCurrencyId,
  outputCurrencyId,
}: TradeRouteRedirectProps): ReactNode {
  useTradeRouteRedirect(route, {
    inputCurrencyFallback,
    defaultInputCurrencyId,
    defaultOutputCurrencyId,
    chainId,
    inputCurrencyId,
    outputCurrencyId,
  })
  return null
}
