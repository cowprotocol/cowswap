import { atom } from 'jotai'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { advancedOrdersDerivedStateAtom } from 'modules/advancedOrders'
import { injectedWidgetPartnerFeeAtom } from 'modules/injectedWidget/state/injectedWidgetParamsAtom'
import { getReceiveAmountInfo, ReceiveAmountInfo } from 'modules/trade'
import { tradeQuoteAtom } from 'modules/tradeQuote'

import { twapOrdersSettingsAtom } from './twapOrdersSettingsAtom'

import { DEFAULT_NUM_OF_PARTS } from '../const'

export interface PartsState {
  numberOfPartsValue: number | null
  inputPartAmount: CurrencyAmount<Currency> | null
  outputPartAmount: CurrencyAmount<Currency> | null
  inputFiatAmount: CurrencyAmount<Currency> | null
  outputFiatAmount: CurrencyAmount<Currency> | null
  receiveAmountInfo: ReceiveAmountInfo | null
}

export const partsStateAtom = atom<PartsState>((get) => {
  const { numberOfPartsValue } = get(twapOrdersSettingsAtom)
  const { response: quoteResponse } = get(tradeQuoteAtom)
  const partnerFee = get(injectedWidgetPartnerFeeAtom)
  const {
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    inputCurrencyFiatAmount,
    outputCurrencyFiatAmount,
  } = get(advancedOrdersDerivedStateAtom)

  const divider = numberOfPartsValue || DEFAULT_NUM_OF_PARTS

  const receiveAmountInfo =
    quoteResponse && inputCurrency && outputCurrency
      ? getReceiveAmountInfo(quoteResponse.quote, inputCurrency, outputCurrency, partnerFee?.bps)
      : null

  return {
    numberOfPartsValue,
    inputPartAmount: inputCurrencyAmount?.divide(divider) || null,
    outputPartAmount: outputCurrencyAmount?.divide(divider) || null,
    inputFiatAmount: inputCurrencyFiatAmount?.divide(divider) || null,
    outputFiatAmount: outputCurrencyFiatAmount?.divide(divider) || null,
    receiveAmountInfo,
  }
})
