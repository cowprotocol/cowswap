import { TokenWithLogo } from '@cowprotocol/common-const'
import { isFractionFalsy } from '@cowprotocol/common-utils'

import { useDerivedTradeState } from './useDerivedTradeState'

import { useTradeQuote } from '../../tradeQuote'
import { useVolumeFee } from '../../volumeFee'
import { getReceiveAmountInfo } from '../utils/getReceiveAmountInfo'

export function useGetReceiveAmountInfo(intermediateCurrency?: TokenWithLogo) {
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount, slippage, orderKind } =
    useDerivedTradeState() ?? {}
  const tradeQuote = useTradeQuote()
  const volumeFee = useVolumeFee()
  const quoteResponse = tradeQuote.quote?.quoteResults.quoteResponse
  const orderParams = quoteResponse?.quote

  if (isFractionFalsy(inputCurrencyAmount) && isFractionFalsy(outputCurrencyAmount)) return null
  // Avoid states mismatch
  if (orderKind !== orderParams?.kind) return null

  if (orderParams && inputCurrency && outputCurrency && slippage) {
    return getReceiveAmountInfo(orderParams, inputCurrency, outputCurrency, slippage, volumeFee?.volumeBps, intermediateCurrency)
  }

  return null
}

