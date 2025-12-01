import { useMemo } from 'react'

import { isFractionFalsy } from '@cowprotocol/common-utils'

import { useDerivedTradeState } from './useDerivedTradeState'

import { useTryFindIntermediateToken } from '../../bridge'
import { useTradeQuote } from '../../tradeQuote'
import { useVolumeFee } from '../../volumeFee'
import { ReceiveAmountInfo } from '../types'
import { getCrossChainReceiveAmountInfo } from '../utils/getCrossChainReceiveAmountInfo'

// eslint-disable-next-line complexity
export function useGetReceiveAmountInfo(): ReceiveAmountInfo | null {
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount, slippage, orderKind } =
    useDerivedTradeState() ?? {}
  const tradeQuote = useTradeQuote()
  const volumeFeeBps = useVolumeFee()?.volumeBps

  const { quote, bridgeQuote } = tradeQuote
  const quoteResponse = quote?.quoteResults.quoteResponse
  const orderParams = quoteResponse?.quote
  const protocolFeeBps = quoteResponse?.protocolFeeBps ? Number(quoteResponse.protocolFeeBps) : undefined
  const bridgeFeeAmounts = bridgeQuote?.amountsAndCosts.costs.bridgingFee
  const bridgeBuyAmount = bridgeQuote?.amountsAndCosts.beforeFee.buyAmount

  const intermediateCurrency =
    useTryFindIntermediateToken({
      bridgeQuote,
    })?.intermediateBuyToken ?? undefined

  return useMemo(() => {
    if (isFractionFalsy(inputCurrencyAmount) && isFractionFalsy(outputCurrencyAmount)) return null
    // Avoid states mismatch
    if (orderKind !== orderParams?.kind) return null

    if (!inputCurrency || !outputCurrency) return null

    if (orderParams && slippage) {
      return getCrossChainReceiveAmountInfo(
        orderParams,
        inputCurrency,
        outputCurrency,
        slippage,
        volumeFeeBps,
        intermediateCurrency,
        bridgeFeeAmounts,
        bridgeBuyAmount,
        protocolFeeBps,
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
    bridgeFeeAmounts,
    bridgeBuyAmount,
    protocolFeeBps,
  ])
}
