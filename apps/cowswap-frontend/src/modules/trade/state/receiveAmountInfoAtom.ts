import { atom } from 'jotai'

import { injectedWidgetPartnerFeeAtom } from 'modules/injectedWidget'
import { tradeQuoteAtom } from 'modules/tradeQuote'

import { derivedTradeStateAtom } from './derivedTradeStateAtom'

import { getReceiveAmountInfo } from '../utils/getReceiveAmountInfo'

export const receiveAmountInfoAtom = atom((get) => {
  const { response: quoteResponse } = get(tradeQuoteAtom)
  const partnerFee = get(injectedWidgetPartnerFeeAtom)
  const { inputCurrency, outputCurrency, slippage } = get(derivedTradeStateAtom) || {}

  if (quoteResponse && inputCurrency && outputCurrency && slippage) {
    return getReceiveAmountInfo(quoteResponse.quote, inputCurrency, outputCurrency, slippage, partnerFee?.bps)
  }

  return null
})
