import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { OrderKind } from '@cowprotocol/cow-sdk'

import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'
import { TradeType, useTradeTypeInfo } from 'modules/trade/hooks/useTradeTypeInfo'
import { partsStateAtom } from 'modules/twap/state/partsStateAtom'

export function useTradeCurrencyAmount() {
  const tradeTypeInfo = useTradeTypeInfo()

  const { state } = useDerivedTradeState()
  const { inputPartAmount } = useAtomValue(partsStateAtom)

  const { inputCurrencyAmount, outputCurrencyAmount, orderKind } = state || {}

  return useMemo(() => {
    // For TWAP orders, we want to get quote only for single part amount
    if (tradeTypeInfo?.tradeType === TradeType.ADVANCED_ORDERS) {
      return inputPartAmount
    }

    return orderKind === OrderKind.SELL ? inputCurrencyAmount : outputCurrencyAmount
  }, [inputCurrencyAmount, inputPartAmount, orderKind, outputCurrencyAmount, tradeTypeInfo])
}
