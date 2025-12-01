import { useMemo } from 'react'

import { isFractionFalsy } from '@cowprotocol/common-utils'

import { useDerivedTradeState } from './useDerivedTradeState'

import { useTryFindIntermediateToken } from '../../bridge'
import { useTradeQuote } from '../../tradeQuote'
import { useVolumeFee } from '../../volumeFee'
import { ReceiveAmountInfo } from '../types'
import { getCrossChainReceiveAmountInfo } from '../utils/getCrossChainReceiveAmountInfo'
import { getReceiveAmountInfo } from '../utils/getReceiveAmountInfo'
import { ReceiveAmountInfoParams } from '../utils/types'

export function useGetReceiveAmountInfo(): ReceiveAmountInfo | null {
  const tradeQuote = useTradeQuote()
  const { bridgeQuote } = tradeQuote
  const bridgeFeeAmounts = bridgeQuote?.amountsAndCosts.costs.bridgingFee
  const bridgeBuyAmount = bridgeQuote?.amountsAndCosts.beforeFee.buyAmount

  const params = useReceiveAmountInfoParams()

  const intermediateCurrency =
    useTryFindIntermediateToken({
      bridgeQuote,
    })?.intermediateBuyToken ?? undefined

  return useMemo(() => {
    if (!params) return null

    if (intermediateCurrency && bridgeFeeAmounts && bridgeBuyAmount) {
      return getCrossChainReceiveAmountInfo({
        ...params,
        intermediateCurrency,
        bridgeFeeAmounts,
        bridgeBuyAmount,
      })
    }

    return getReceiveAmountInfo(params)
  }, [params, intermediateCurrency, bridgeFeeAmounts, bridgeBuyAmount])
}

function useReceiveAmountInfoParams(): ReceiveAmountInfoParams | null {
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount, slippage, orderKind } =
    useDerivedTradeState() ?? {}
  const tradeQuote = useTradeQuote()
  const volumeFeeBps = useVolumeFee()?.volumeBps

  const quoteResponse = tradeQuote?.quote?.quoteResults.quoteResponse
  const orderParams = quoteResponse?.quote
  const protocolFeeBps = quoteResponse?.protocolFeeBps ? Number(quoteResponse.protocolFeeBps) : undefined

  return useMemo(() => {
    if (isFractionFalsy(inputCurrencyAmount) && isFractionFalsy(outputCurrencyAmount)) return null
    // Avoid states mismatch
    if (orderKind !== orderParams?.kind) return null

    if (!inputCurrency || !outputCurrency || !orderParams || !slippage) return null

    return {
      orderParams,
      inputCurrency,
      outputCurrency,
      slippagePercent: slippage,
      partnerFeeBps: volumeFeeBps,
      protocolFeeBps,
    }
  }, [
    orderParams,
    volumeFeeBps,
    inputCurrencyAmount,
    outputCurrency,
    orderKind,
    inputCurrency,
    outputCurrencyAmount,
    slippage,
    protocolFeeBps,
  ])
}
