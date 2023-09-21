import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { OrderKind } from '@cowprotocol/cow-sdk'

import { Field } from 'legacy/state/types'

import { useTradeUsdAmounts } from 'modules/usdAmount'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

import { SwapDerivedState, swapDerivedStateAtom } from './swapDerivedStateAtom'

import { useDerivedSwapInfo, useSwapState } from '../hooks/useSwapState'

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
  const inputCurrencyAmount = isSellTrade ? parsedAmount : v2Trade?.inputAmountWithoutFee
  const outputCurrencyAmount = !isSellTrade ? parsedAmount : v2Trade?.outputAmountWithoutFee

  const {
    inputAmount: { value: inputCurrencyFiatAmount },
    outputAmount: { value: outputCurrencyFiatAmount },
  } = useTradeUsdAmounts(inputCurrencyAmount, outputCurrencyAmount)

  const updateDerivedState = useSetAtom(swapDerivedStateAtom)

  const state = useSafeMemoObject({
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount: inputCurrencyAmount || null,
    outputCurrencyAmount: outputCurrencyAmount || null,
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
