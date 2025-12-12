import { useMemo } from 'react'

import { useTokenByAddress } from '@cowprotocol/tokens'
import { Nullish } from '@cowprotocol/types'
import { Currency } from '@uniswap/sdk-core'

import { useTradeQuote } from 'modules/tradeQuote'
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
  const slippage = derivedTradeState?.slippage

  const quoteResponse = tradeQuote?.quote?.quoteResults.quoteResponse
  const orderParams = quoteResponse?.quote
  const protocolFeeBps = quoteResponse?.protocolFeeBps ? Number(quoteResponse.protocolFeeBps) : undefined

  const { inputCurrency, outputCurrency } = useQuoteCurrencies()

  return useMemo(() => {
    // Avoid states mismatch
    if (orderKind !== orderParams?.kind) return null
    if (!orderParams || !slippage || !inputCurrency || !outputCurrency) return null

    return {
      orderParams,
      inputCurrency,
      outputCurrency,
      slippagePercent: slippage,
      partnerFeeBps: volumeFeeBps,
      protocolFeeBps,
    }
  }, [orderKind, orderParams, volumeFeeBps, inputCurrency, outputCurrency, slippage, protocolFeeBps])
}

function useQuoteCurrencies(): ReceiveAmountCurrencies {
  const tradeQuote = useTradeQuote()
  const quoteResponse = tradeQuote?.quote?.quoteResults.quoteResponse

  const inputCurrency = useTokenByAddress(quoteResponse?.quote?.sellToken.toLowerCase())
  const outputCurrency = useTokenByAddress(quoteResponse?.quote?.buyToken.toLowerCase())

  return { inputCurrency, outputCurrency }
}
