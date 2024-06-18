import { atom } from 'jotai'

import { isFractionFalsy } from '@cowprotocol/common-utils'

import { injectedWidgetPartnerFeeAtom } from 'modules/injectedWidget'
import { tradeQuoteAtom } from 'modules/tradeQuote'

import { derivedTradeStateAtom } from './derivedTradeStateAtom'

import { getReceiveAmountInfo } from '../utils/getReceiveAmountInfo'

export const receiveAmountInfoAtom = atom((get) => {
  const { response: quoteResponse } = get(tradeQuoteAtom)
  const partnerFee = get(injectedWidgetPartnerFeeAtom)
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount, slippage } =
    get(derivedTradeStateAtom) || {}

  if (isFractionFalsy(inputCurrencyAmount) && isFractionFalsy(outputCurrencyAmount)) return null

  if (quoteResponse && inputCurrency && outputCurrency && slippage) {
    return getReceiveAmountInfo(quoteResponse.quote, inputCurrency, outputCurrency, slippage, partnerFee?.bps)
  }

  return null
})
