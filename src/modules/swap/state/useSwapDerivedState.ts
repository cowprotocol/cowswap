import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

import { OrderKind } from '@cowprotocol/cow-sdk'

import { useHigherUSDValue } from 'legacy/hooks/useStablecoinPrice'
import { Field } from 'legacy/state/swap/actions'
import { useDerivedSwapInfo, useSwapState } from 'legacy/state/swap/hooks'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

import { SwapDerivedState, swapDerivedStateAtom } from './swapDerivedStateAtom'

export function useSwapDerivedState(): SwapDerivedState {
  return useAtomValue(swapDerivedStateAtom)
}

export function useFillSwapDerivedState() {
  const { independentField, recipient } = useSwapState()
  const { v2Trade, currencyBalances, slippageAdjustedSellAmount } = useDerivedSwapInfo()

  const inputCurrencyBalance = currencyBalances.INPUT || null
  const outputCurrencyBalance = currencyBalances.OUTPUT || null
  const inputCurrencyAmount = v2Trade?.inputAmount || null
  const outputCurrencyAmount = v2Trade?.outputAmount || null

  const inputCurrencyFiatAmount = useHigherUSDValue(inputCurrencyAmount || undefined)
  const outputCurrencyFiatAmount = useHigherUSDValue(outputCurrencyAmount || undefined)

  const updateDerivedState = useUpdateAtom(swapDerivedStateAtom)

  const context = useSafeMemoObject({
    inputCurrencyAmount,
    outputCurrencyAmount,
    slippageAdjustedSellAmount,
    inputCurrencyBalance,
    outputCurrencyBalance,
    inputCurrencyFiatAmount,
    outputCurrencyFiatAmount,
    recipient,
  })

  useEffect(() => {
    updateDerivedState({
      ...context,
      inputCurrency: context.inputCurrencyAmount?.currency || null,
      outputCurrency: context.outputCurrencyAmount?.currency || null,
      recipient,
      orderKind: independentField === Field.INPUT ? OrderKind.SELL : OrderKind.BUY,
    })
  }, [context, recipient, independentField, updateDerivedState])
}
