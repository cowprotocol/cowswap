import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { OrderKind } from '@cowprotocol/cow-sdk'
import { useENSAddress } from '@cowprotocol/ens'

import { Field } from 'legacy/state/types'

import { TradeType } from 'modules/trade'
import { useTradeSlippage } from 'modules/tradeSlippage'
import { useTradeUsdAmounts } from 'modules/usdAmount'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

import { swapDerivedStateAtom } from './swapDerivedStateAtom'

import { useDerivedSwapInfo, useSwapState } from '../hooks/useSwapState'

export function useFillSwapDerivedState() {
  const { independentField, recipient } = useSwapState()
  const { address: recipientAddress } = useENSAddress(recipient)
  const { trade, currencyBalances, currencies, slippageAdjustedSellAmount, slippageAdjustedBuyAmount, parsedAmount } =
    useDerivedSwapInfo()
  const slippage = useTradeSlippage()

  const isSellTrade = independentField === Field.INPUT
  const inputCurrency = currencies.INPUT || null
  const outputCurrency = currencies.OUTPUT || null
  const inputCurrencyBalance = currencyBalances.INPUT || null
  const outputCurrencyBalance = currencyBalances.OUTPUT || null
  const inputCurrencyAmount = isSellTrade ? parsedAmount : trade?.inputAmountWithoutFee
  const outputCurrencyAmount = !isSellTrade ? parsedAmount : trade?.outputAmountWithoutFee

  const {
    inputAmount: { value: inputCurrencyFiatAmount },
    outputAmount: { value: outputCurrencyFiatAmount },
  } = useTradeUsdAmounts(inputCurrencyAmount, outputCurrencyAmount, undefined, undefined, true)

  const updateDerivedState = useSetAtom(swapDerivedStateAtom)

  const state = useSafeMemoObject({
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount: inputCurrencyAmount || null,
    outputCurrencyAmount: outputCurrencyAmount || null,
    slippageAdjustedSellAmount,
    slippageAdjustedBuyAmount,
    inputCurrencyBalance,
    outputCurrencyBalance,
    inputCurrencyFiatAmount,
    outputCurrencyFiatAmount,
    recipient,
    recipientAddress,
    orderKind: isSellTrade ? OrderKind.SELL : OrderKind.BUY,
    tradeType: TradeType.SWAP,
    slippage,
  })

  useEffect(() => {
    updateDerivedState(state)
  }, [state, updateDerivedState])
}
