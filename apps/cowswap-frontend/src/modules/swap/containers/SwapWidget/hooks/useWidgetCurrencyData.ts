import { useMemo } from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'

import { Field } from 'legacy/state/types'

import { useGetReceiveAmountInfo } from 'modules/trade'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import type { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import { useSwapDerivedState } from '../../../hooks/useSwapDerivedState'

export interface CurrencyData {
  isSellTrade: boolean
  inputCurrencyInfo: CurrencyInfo
  outputCurrencyInfo: CurrencyInfo
  inputPreviewInfo: CurrencyPreviewInfo
  outputPreviewInfo: CurrencyPreviewInfo
  rateInfoParams: ReturnType<typeof useRateInfoParams>
  buyingFiatAmount: CurrencyInfo['fiatAmount']
}

export function useCurrencyData({
  derivedState,
  receiveAmountInfo,
}: {
  derivedState: ReturnType<typeof useSwapDerivedState>
  receiveAmountInfo: ReturnType<typeof useGetReceiveAmountInfo>
}): CurrencyData {
  const isSellTrade = isSellOrder(derivedState.orderKind)
  const inputCurrencyInfo = useInputCurrencyInfo({ derivedState, isSellTrade, receiveAmountInfo })
  const outputCurrencyInfo = useOutputCurrencyInfo({ derivedState, isSellTrade, receiveAmountInfo })
  const inputPreviewInfo = useCurrencyPreviewInfo(
    inputCurrencyInfo,
    isSellTrade ? 'Sell amount' : 'Expected sell amount',
  )
  const outputPreviewInfo = useCurrencyPreviewInfo(
    outputCurrencyInfo,
    isSellTrade ? 'Receive (before fees)' : 'Buy exactly',
  )
  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)
  const buyingFiatAmount = useBuyingFiatAmount(isSellTrade, outputCurrencyInfo.fiatAmount, inputCurrencyInfo.fiatAmount)

  return useMemo(
    () => ({
      isSellTrade,
      inputCurrencyInfo,
      outputCurrencyInfo,
      inputPreviewInfo,
      outputPreviewInfo,
      rateInfoParams,
      buyingFiatAmount,
    }),
    [
      isSellTrade,
      inputCurrencyInfo,
      outputCurrencyInfo,
      inputPreviewInfo,
      outputPreviewInfo,
      rateInfoParams,
      buyingFiatAmount,
    ],
  )
}

function useInputCurrencyInfo({
  derivedState,
  isSellTrade,
  receiveAmountInfo,
}: {
  derivedState: ReturnType<typeof useSwapDerivedState>
  isSellTrade: boolean
  receiveAmountInfo: ReturnType<typeof useGetReceiveAmountInfo>
}): CurrencyInfo {
  return useMemo(
    () => ({
      field: Field.INPUT,
      currency: derivedState.inputCurrency,
      amount: derivedState.inputCurrencyAmount,
      isIndependent: isSellTrade,
      balance: derivedState.inputCurrencyBalance,
      fiatAmount: derivedState.inputCurrencyFiatAmount,
      receiveAmountInfo: isSellTrade ? null : receiveAmountInfo,
    }),
    [
      derivedState.inputCurrency,
      derivedState.inputCurrencyAmount,
      derivedState.inputCurrencyBalance,
      derivedState.inputCurrencyFiatAmount,
      isSellTrade,
      receiveAmountInfo,
    ],
  )
}

function useOutputCurrencyInfo({
  derivedState,
  isSellTrade,
  receiveAmountInfo,
}: {
  derivedState: ReturnType<typeof useSwapDerivedState>
  isSellTrade: boolean
  receiveAmountInfo: ReturnType<typeof useGetReceiveAmountInfo>
}): CurrencyInfo {
  return useMemo(
    () => ({
      field: Field.OUTPUT,
      currency: derivedState.outputCurrency,
      amount: derivedState.outputCurrencyAmount,
      isIndependent: !isSellTrade,
      balance: derivedState.outputCurrencyBalance,
      fiatAmount: derivedState.outputCurrencyFiatAmount,
      receiveAmountInfo: isSellTrade ? receiveAmountInfo : null,
    }),
    [
      derivedState.outputCurrency,
      derivedState.outputCurrencyAmount,
      derivedState.outputCurrencyBalance,
      derivedState.outputCurrencyFiatAmount,
      isSellTrade,
      receiveAmountInfo,
    ],
  )
}

function useCurrencyPreviewInfo(currencyInfo: CurrencyInfo, label: string): CurrencyPreviewInfo {
  return useMemo(
    () => ({
      amount: currencyInfo.amount,
      fiatAmount: currencyInfo.fiatAmount,
      balance: currencyInfo.balance,
      label,
    }),
    [currencyInfo.amount, currencyInfo.fiatAmount, currencyInfo.balance, label],
  )
}

function useBuyingFiatAmount(
  isSellTrade: boolean,
  outputFiatAmount: CurrencyInfo['fiatAmount'],
  inputFiatAmount: CurrencyInfo['fiatAmount'],
): CurrencyInfo['fiatAmount'] {
  return useMemo(
    () => (isSellTrade ? outputFiatAmount : inputFiatAmount),
    [isSellTrade, outputFiatAmount, inputFiatAmount],
  )
}
