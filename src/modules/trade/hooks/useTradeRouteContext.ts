import { useMemo } from 'react'

import { useTradeState } from './useTradeState'

import { TradeUrlParams } from '../types/TradeRawState'

export function useTradeRouteContext(): TradeUrlParams {
  const { state } = useTradeState()
  const { inputCurrencyId, outputCurrencyId, chainId } = state || {}

  return useMemo(
    () => ({
      inputCurrencyId: inputCurrencyId || undefined,
      outputCurrencyId: outputCurrencyId || undefined,
      chainId: chainId?.toString(),
    }),
    [inputCurrencyId, outputCurrencyId, chainId]
  )
}
