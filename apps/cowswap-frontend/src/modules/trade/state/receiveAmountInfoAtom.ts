import { atom } from 'jotai'

import { getCurrencyAddress, isFractionFalsy } from '@cowprotocol/common-utils'

import { tradeQuotesAtom } from 'modules/tradeQuote'
import { volumeFeeAtom } from 'modules/volumeFee'

import { derivedTradeStateAtom } from './derivedTradeStateAtom'

import { getReceiveAmountInfo } from '../utils/getReceiveAmountInfo'

// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
export const receiveAmountInfoAtom = atom((get) => {
  const tradeQuotes = get(tradeQuotesAtom)
  const volumeFee = get(volumeFeeAtom)
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount, slippage, orderKind } =
    get(derivedTradeStateAtom) || {}
  const quoteResponse =
    inputCurrency && tradeQuotes[getCurrencyAddress(inputCurrency).toLowerCase()]?.quote?.quoteResults.quoteResponse

  if (isFractionFalsy(inputCurrencyAmount) && isFractionFalsy(outputCurrencyAmount)) return null

  // Avoid states mismatch
  if (orderKind !== quoteResponse?.quote.kind) return null

  if (quoteResponse && inputCurrency && outputCurrency && slippage) {
    return getReceiveAmountInfo(quoteResponse.quote, inputCurrency, outputCurrency, slippage, volumeFee?.volumeBps)
  }

  return null
})
