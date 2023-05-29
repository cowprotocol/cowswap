import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { SwapDerivedState, swapDerivedStateAtom } from './swapDerivedStateAtom'
import { useDerivedSwapInfo, useSwapState } from 'legacy/state/swap/hooks'
import { Field } from 'legacy/state/swap/actions'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { useHigherUSDValue } from 'legacy/hooks/useStablecoinPrice'

export function useSwapDerivedState(): SwapDerivedState {
  return useAtomValue(swapDerivedStateAtom)
}

export function useFillSwapDerivedState() {
  const { independentField, recipient } = useSwapState()
  const { v2Trade, currencyBalances, currencies, slippageAdjustedSellAmount } = useDerivedSwapInfo()

  const inputCurrency = currencies.INPUT || null
  const outputCurrency = currencies.OUTPUT || null
  const inputCurrencyBalance = currencyBalances.INPUT || null
  const outputCurrencyBalance = currencyBalances.OUTPUT || null
  const inputCurrencyAmount = v2Trade?.inputAmount || null
  const outputCurrencyAmount = v2Trade?.outputAmount || null

  const inputCurrencyFiatAmount = useHigherUSDValue(inputCurrencyAmount || undefined)
  const outputCurrencyFiatAmount = useHigherUSDValue(outputCurrencyAmount || undefined)

  const updateDerivedState = useUpdateAtom(swapDerivedStateAtom)

  useEffect(() => {
    updateDerivedState({
      inputCurrency,
      outputCurrency,
      inputCurrencyAmount,
      outputCurrencyAmount,
      slippageAdjustedSellAmount,
      inputCurrencyBalance,
      outputCurrencyBalance,
      inputCurrencyFiatAmount,
      outputCurrencyFiatAmount,
      recipient,
      orderKind: independentField === Field.INPUT ? OrderKind.SELL : OrderKind.BUY,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount?.quotient,
    outputCurrencyAmount?.quotient,
    slippageAdjustedSellAmount?.quotient,
    inputCurrencyBalance?.quotient,
    outputCurrencyBalance?.quotient,
    inputCurrencyFiatAmount?.quotient,
    outputCurrencyFiatAmount?.quotient,
    recipient,
    independentField,
    updateDerivedState,
  ])
}
