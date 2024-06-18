import { useMemo } from 'react'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useTradeState } from './useTradeState'

import { TradeUrlParams } from '../types/TradeRawState'

export function useTradeRouteContext(): TradeUrlParams {
  const { state } = useTradeState()
  const derivedState = useDerivedTradeState()
  const { orderKind, inputCurrencyAmount, outputCurrencyAmount } = derivedState || {}
  const { inputCurrencyId, outputCurrencyId, chainId } = state || {}

  const inputCurrencyAmountStr = inputCurrencyAmount?.toExact()
  const outputCurrencyAmountStr = outputCurrencyAmount?.toExact()

  return useMemo(
    () => ({
      inputCurrencyId: inputCurrencyId || undefined,
      outputCurrencyId: outputCurrencyId || undefined,
      inputCurrencyAmount: inputCurrencyAmountStr,
      outputCurrencyAmount: outputCurrencyAmountStr,
      chainId: chainId?.toString(),
      orderKind,
    }),
    [inputCurrencyId, outputCurrencyId, chainId, inputCurrencyAmountStr, outputCurrencyAmountStr]
  )
}
