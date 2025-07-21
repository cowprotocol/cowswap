import { useMemo } from 'react'

import { isFractionFalsy } from '@cowprotocol/common-utils'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useGetIntermediateSellTokenIfExists } from './useGetIntermediateSellTokenIfExists'

import { useTradeQuote } from '../../tradeQuote'
import { useVolumeFee } from '../../volumeFee'
import { ReceiveAmountInfo } from '../types'
import { getReceiveAmountInfo } from '../utils/getReceiveAmountInfo'

export function useGetReceiveAmountInfo(): ReceiveAmountInfo | null {
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount, slippage, orderKind } =
    useDerivedTradeState() ?? {}
  const tradeQuote = useTradeQuote()
  const volumeFeeBps = useVolumeFee()?.volumeBps
  const quoteResponse = tradeQuote.quote?.quoteResults.quoteResponse
  const orderParams = quoteResponse?.quote
  const intermediateCurrency = useGetIntermediateSellTokenIfExists(orderParams)

  return useMemo(() => {
    if (isFractionFalsy(inputCurrencyAmount) && isFractionFalsy(outputCurrencyAmount)) return null
    // Avoid states mismatch
    if (orderKind !== orderParams?.kind) return null

    if (orderParams && inputCurrency && outputCurrency && slippage) {
      return getReceiveAmountInfo(
        orderParams,
        inputCurrency,
        outputCurrency,
        slippage,
        volumeFeeBps,
        intermediateCurrency,
      )
    }

    return null
  }, [
    orderParams,
    intermediateCurrency,
    volumeFeeBps,
    inputCurrencyAmount,
    outputCurrency,
    orderKind,
    inputCurrency,
    outputCurrencyAmount,
    slippage,
  ])
}
