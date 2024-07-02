import { useEffect, useMemo, useRef } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useTradeState } from './useTradeState'

import { getDefaultTradeRawState, TradeUrlParams } from '../types/TradeRawState'

export function useTradeRouteContext(): TradeUrlParams {
  const { chainId: walletChainId } = useWalletInfo()
  const { state } = useTradeState()
  const derivedState = useDerivedTradeState()
  const prevContextRef = useRef<TradeUrlParams>()

  const { orderKind, inputCurrencyAmount, outputCurrencyAmount } = derivedState || {}
  const targetChainId = state?.chainId || walletChainId
  const { inputCurrencyId, outputCurrencyId } = state || getDefaultTradeRawState(targetChainId)

  const prevContext = prevContextRef.current

  const inputCurrencyAmountStr = inputCurrencyAmount?.toExact()
  const outputCurrencyAmountStr = outputCurrencyAmount?.toExact()

  const context: TradeUrlParams = useMemo(
    () => ({
      inputCurrencyId: inputCurrencyId || undefined,
      outputCurrencyId: outputCurrencyId || undefined,
      inputCurrencyAmount: inputCurrencyAmountStr,
      outputCurrencyAmount: outputCurrencyAmountStr,
      chainId: targetChainId?.toString(),
      orderKind,
    }),
    [orderKind, inputCurrencyId, outputCurrencyId, targetChainId, inputCurrencyAmountStr, outputCurrencyAmountStr]
  )

  useEffect(() => {
    if (state) {
      prevContextRef.current = context
    }
  }, [state, context])

  /**
   * If there is no state, it means that current page is not a trade widget page. For example: account page.
   * In this case, we should take the previous context to keep the trade widget state.
   */
  return !state && prevContext ? prevContext : context
}
