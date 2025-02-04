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
  const hasState = !!state
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
      chainId: targetChainId.toString(),
      orderKind,
    }),
    [orderKind, inputCurrencyId, outputCurrencyId, targetChainId, inputCurrencyAmountStr, outputCurrencyAmountStr],
  )

  useEffect(() => {
    prevContextRef.current = hasState ? context : undefined
  }, [hasState, context])

  return !state && prevContext ? prevContext : context
}
