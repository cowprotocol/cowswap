import { useMemo } from 'react'

import { isFractionFalsy } from '@cowprotocol/common-utils'

import { useDerivedTradeState } from './useDerivedTradeState'

import { useTryFindIntermediateToken } from '../../bridge'
import { useTradeQuote } from '../../tradeQuote'
import { useVolumeFee } from '../../volumeFee'
import { ReceiveAmountInfo } from '../types'
import { getReceiveAmountInfo } from '../utils/getReceiveAmountInfo'

export function useGetReceiveAmountInfo(): ReceiveAmountInfo | null {
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount, slippage, orderKind } =
    useDerivedTradeState() ?? {}
  const tradeQuote = useTradeQuote()
  const volumeFeeBps = useVolumeFee()?.volumeBps

  const { quote, bridgeQuote } = tradeQuote
  const quoteResponse = quote?.quoteResults.quoteResponse
  const orderParams = quoteResponse?.quote
  const bridgeFeeRaw = bridgeQuote?.amountsAndCosts.costs.bridgingFee.amountInSellCurrency

  const intermediateCurrency = useTryFindIntermediateToken({
    bridgeQuote: tradeQuote.bridgeQuote
  })?.intermediateBuyToken ?? undefined

  return useMemo(() => {
    if (isFractionFalsy(inputCurrencyAmount) && isFractionFalsy(outputCurrencyAmount)) return null
    // Avoid states mismatch
    if (orderKind !== orderParams?.kind) return null

    if (!inputCurrency || !outputCurrency) return null

    if (orderParams && slippage) {
      return getReceiveAmountInfo(
        orderParams,
        inputCurrency,
        outputCurrency,
        slippage,
        volumeFeeBps,
        intermediateCurrency,
        bridgeFeeRaw,
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
    bridgeFeeRaw,
  ])
}
