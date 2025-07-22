import { useMemo } from 'react'

import { isFractionFalsy } from '@cowprotocol/common-utils'
import { Currency, Price } from '@uniswap/sdk-core'

import { useDerivedTradeState } from './useDerivedTradeState'

import { useTryFindIntermediateToken } from '../../bridge'
import { useTradeQuote } from '../../tradeQuote'
import { useVolumeFee } from '../../volumeFee'
import { AmountsAndCosts, getReceiveAmountInfo } from '../utils/getReceiveAmountInfo'

// todo should be transformed to an atom to avoid recomputations
// but for this purpose we need to share tokenList atom (move it to entities)
export function useGetReceiveAmountInfo(): (AmountsAndCosts & { quotePrice: Price<Currency, Currency> }) | null {
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount, slippage, orderKind } =
    useDerivedTradeState() ?? {}
  const tradeQuote = useTradeQuote()
  const volumeFeeBps = useVolumeFee()?.volumeBps
  const quoteResponse = tradeQuote.quote?.quoteResults.quoteResponse
  const orderParams = quoteResponse?.quote
  const intermediateCurrency = useTryFindIntermediateToken({
    bridgeQuote: tradeQuote.bridgeQuote
  })?.intermediateBuyToken ?? undefined

  return useMemo(() => {
    if (isFractionFalsy(inputCurrencyAmount) && isFractionFalsy(outputCurrencyAmount)) return null
    // Avoid states mismatch
    if (orderKind !== orderParams?.kind) return null

    if (orderParams && inputCurrency && outputCurrency && slippage) {
      return getReceiveAmountInfo(orderParams, inputCurrency, outputCurrency, slippage, volumeFeeBps, intermediateCurrency)
    }

    return null
  }, [orderParams, intermediateCurrency, volumeFeeBps, inputCurrencyAmount, outputCurrency, orderKind, inputCurrency, outputCurrencyAmount, slippage])
}

