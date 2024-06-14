import { atom } from 'jotai'

import { injectedWidgetPartnerFeeAtom } from 'modules/injectedWidget'
import { tradeQuoteAtom } from 'modules/tradeQuote'

import { derivedTradeStateAtom } from './derivedTradeStateAtom'

import { getReceiveAmountInfo } from '../utils/getReceiveAmountInfo'

export const receiveAmountInfoAtom = atom((get) => {
  const { response: quoteResponse } = get(tradeQuoteAtom)
  const partnerFee = get(injectedWidgetPartnerFeeAtom)
  const { inputCurrencyAmount, outputCurrencyAmount, slippage } = get(derivedTradeStateAtom) || {}

  if (quoteResponse && inputCurrencyAmount && outputCurrencyAmount && slippage) {
    return getReceiveAmountInfo(
      quoteResponse.quote,
      inputCurrencyAmount.currency,
      outputCurrencyAmount.currency,
      slippage,
      partnerFee?.bps
    )
  }

  return null
})
