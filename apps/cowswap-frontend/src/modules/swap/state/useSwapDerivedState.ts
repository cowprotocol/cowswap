import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { OrderKind } from '@cowprotocol/cow-sdk'

import { Field } from 'legacy/state/swap/actions'
import { useDerivedSwapInfo, useSwapState } from 'legacy/state/swap/hooks'

import { useHigherUSDValue } from 'modules/fiatAmount'

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

  const inputCurrencyFiatAmount = useHigherUSDValue(inputCurrencyAmount || undefined).value
  const outputCurrencyFiatAmount = useHigherUSDValue(outputCurrencyAmount || undefined).value

  const updateDerivedState = useSetAtom(swapDerivedStateAtom)

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
