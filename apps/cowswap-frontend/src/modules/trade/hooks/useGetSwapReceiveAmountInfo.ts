import { useMemo } from 'react'

import { getAddressKey } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'
import { useTokenByAddress } from '@cowprotocol/tokens'
import { Nullish } from '@cowprotocol/types'

import { useTradeQuote, useTradeQuoteProtocolFee } from 'modules/tradeQuote'
import { useVolumeFee } from 'modules/volumeFee'

import { useDerivedTradeState } from './useDerivedTradeState'

import { ReceiveAmountInfo } from '../types'
import { getReceiveAmountInfo } from '../utils/getReceiveAmountInfo'
import { ReceiveAmountInfoParams } from '../utils/types'

interface ReceiveAmountCurrencies {
  inputCurrency: Nullish<Currency>
  outputCurrency: Nullish<Currency>
}

export function useGetSwapReceiveAmountInfo(): ReceiveAmountInfo | null {
  const params = useSwapReceiveAmountInfoParams()

  return useMemo(() => (params ? getReceiveAmountInfo(params) : null), [params])
}

export function useSwapReceiveAmountInfoParams(): ReceiveAmountInfoParams | null {
  const derivedTradeState = useDerivedTradeState()
  const tradeQuote = useTradeQuote()
  const volumeFeeBps = useVolumeFee()?.volumeBps
  const orderKind = derivedTradeState?.orderKind
  const derivedSlippage = derivedTradeState?.slippage

  const quoteResults = tradeQuote?.quote?.quoteResults
  const quoteResponse = quoteResults?.quoteResponse
  const orderParams = quoteResponse?.quote
  const protocolFeeBps = useTradeQuoteProtocolFee()

  const { inputCurrency, outputCurrency } = useQuoteCurrencies()

  return useMemo(() => {
    // Avoid states mismatch
    if (orderKind !== orderParams?.kind) return null
    if (!orderParams || !inputCurrency || !outputCurrency || !derivedSlippage) return null

    return {
      orderParams,
      inputCurrency,
      outputCurrency,
      slippagePercent: derivedSlippage,
      partnerFeeBps: volumeFeeBps,
      protocolFeeBps,
    }
  }, [orderKind, orderParams, volumeFeeBps, inputCurrency, outputCurrency, protocolFeeBps, derivedSlippage])
}

function useQuoteCurrencies(): ReceiveAmountCurrencies {
  const tradeQuote = useTradeQuote()
  const quoteResponse = tradeQuote?.quote?.quoteResults.quoteResponse

  const inputCurrency = useTokenByAddress(
    quoteResponse?.quote?.sellToken ? getAddressKey(quoteResponse.quote.sellToken) : undefined,
  )
  const outputCurrency = useTokenByAddress(
    quoteResponse?.quote?.buyToken ? getAddressKey(quoteResponse.quote.buyToken) : undefined,
  )

  return { inputCurrency, outputCurrency }
}
