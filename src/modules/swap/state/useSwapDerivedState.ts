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
  const { independentField, recipient, recipientAddress } = useSwapState()
  const { v2Trade, currencyBalances, currencies, slippageAdjustedSellAmount, parsedAmount } = useDerivedSwapInfo()

  const isSellTrade = independentField === Field.INPUT
  const inputCurrency = currencies.INPUT || null
  const outputCurrency = currencies.OUTPUT || null
  const inputCurrencyBalance = currencyBalances.INPUT || null
  const outputCurrencyBalance = currencyBalances.OUTPUT || null
  const inputCurrencyAmount = (isSellTrade ? parsedAmount : v2Trade?.inputAmountWithoutFee) || null
  const outputCurrencyAmount = (!isSellTrade ? parsedAmount : v2Trade?.outputAmountWithoutFee) || null

  const inputCurrencyFiatAmount = useHigherUSDValue(inputCurrencyAmount || undefined)
  const outputCurrencyFiatAmount = useHigherUSDValue(outputCurrencyAmount || undefined)

  const updateDerivedState = useUpdateAtom(swapDerivedStateAtom)

  const state = useSafeMemoObject({
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
    recipientAddress,
    orderKind: isSellTrade ? OrderKind.SELL : OrderKind.BUY,
  })

  useEffect(() => {
    updateDerivedState(state)
  }, [state, updateDerivedState])
}
