import { useEffect, useMemo, useRef } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useTradeState } from './useTradeState'

import { getDefaultTradeRawState, TradeUrlParams } from '../types'

export function useTradeRouteContext(): TradeUrlParams {
  const { chainId: walletChainId } = useWalletInfo()
  const { state } = useTradeState()
  const derivedState = useDerivedTradeState()
  const prevContextRef = useRef<TradeUrlParams>(undefined)

  const { orderKind, inputCurrencyAmount, outputCurrencyAmount } = derivedState || {}
  const hasState = !!state
  const sourceChainId = state?.chainId || walletChainId
  const { inputCurrencyId, outputCurrencyId, targetChainId } = state || getDefaultTradeRawState(sourceChainId)

  const prevContext = prevContextRef.current

  const inputCurrencyAmountStr = inputCurrencyAmount?.toExact()
  const outputCurrencyAmountStr = outputCurrencyAmount?.toExact()

  const context: TradeUrlParams = useMemo(
    () => ({
      inputCurrencyId: inputCurrencyId || undefined,
      outputCurrencyId: outputCurrencyId || undefined,
      inputCurrencyAmount: inputCurrencyAmountStr,
      outputCurrencyAmount: outputCurrencyAmountStr,
      chainId: sourceChainId.toString(),
      targetChainId: targetChainId?.toString(),
      orderKind,
    }),
    [
      orderKind,
      inputCurrencyId,
      outputCurrencyId,
      sourceChainId,
      targetChainId,
      inputCurrencyAmountStr,
      outputCurrencyAmountStr,
    ],
  )

  useEffect(() => {
    prevContextRef.current = hasState ? context : undefined
  }, [hasState, context])

  /**
   * If there is no state, it means that current page is not a trade widget page. For example: account page.
   * In this case, we should take the previous context to keep the trade widget state.
   */
  return !state && prevContext ? prevContext : context
}
