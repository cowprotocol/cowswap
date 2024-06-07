import { useMemo } from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useTradeState } from './useTradeState'

import { TradeUrlParams } from '../types/TradeRawState'

export function useTradeRouteContext(): TradeUrlParams {
  const { state } = useTradeState()
  const { state: derivedState } = useDerivedTradeState()
  const { orderKind, inputCurrencyAmount, outputCurrencyAmount } = derivedState || {}
  const { inputCurrencyId, outputCurrencyId, chainId } = state || {}

  const sellOrder = orderKind && isSellOrder(orderKind)
  const inputCurrencyAmountStr = inputCurrencyAmount?.toExact()
  const outputCurrencyAmountStr = outputCurrencyAmount?.toExact()

  return useMemo(
    () => ({
      inputCurrencyId: inputCurrencyId || undefined,
      outputCurrencyId: outputCurrencyId || undefined,
      inputCurrencyAmount: sellOrder ? inputCurrencyAmountStr : undefined,
      outputCurrencyAmount: sellOrder ? undefined : outputCurrencyAmountStr,
      chainId: chainId?.toString(),
    }),
    [inputCurrencyId, outputCurrencyId, chainId, sellOrder, inputCurrencyAmountStr, outputCurrencyAmountStr]
  )
}
