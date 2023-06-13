import { useMemo } from 'react'

import { useTradeState } from './useTradeState'

import { TradeUrlParams } from '../types/TradeRawState'

export function useTradeRouteContext(): TradeUrlParams {
  const { state } = useTradeState()

  return useMemo(
    () => ({
      inputCurrencyId: state?.inputCurrencyId || undefined,
      outputCurrencyId: state?.outputCurrencyId || undefined,
      chainId: state?.chainId?.toString(),
    }),
    [state]
  )
}
