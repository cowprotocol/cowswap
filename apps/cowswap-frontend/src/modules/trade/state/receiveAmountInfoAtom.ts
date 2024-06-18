import { atom } from 'jotai'

import { isFractionFalsy } from '@cowprotocol/common-utils'

import { tradeQuoteAtom } from 'modules/tradeQuote'
import { volumeFeeAtom } from 'modules/volumeFee'

import { derivedTradeStateAtom } from './derivedTradeStateAtom'

import { getReceiveAmountInfo } from '../utils/getReceiveAmountInfo'

export const receiveAmountInfoAtom = atom((get) => {
  const { response: quoteResponse } = get(tradeQuoteAtom)
  const volumeFee = get(volumeFeeAtom)
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount, slippage } =
    get(derivedTradeStateAtom) || {}

  if (isFractionFalsy(inputCurrencyAmount) && isFractionFalsy(outputCurrencyAmount)) return null

  if (quoteResponse && inputCurrency && outputCurrency && slippage) {
    return getReceiveAmountInfo(quoteResponse.quote, inputCurrency, outputCurrency, slippage, volumeFee?.bps)
  }

  return null
})
