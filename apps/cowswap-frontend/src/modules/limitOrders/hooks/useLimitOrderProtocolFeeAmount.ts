import { useMemo } from 'react'

import { bpsToPercent } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useDerivedTradeState } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'

export function useLimitOrderProtocolFeeAmount(): CurrencyAmount<Currency> | null {
  const state = useDerivedTradeState()
  const { quote } = useTradeQuote()
  const quoteResponse = quote?.quoteResults.quoteResponse
  const protocolFeeBps = quoteResponse?.protocolFeeBps ? Number(quoteResponse.protocolFeeBps) : undefined
  const outputCurrencyAmount = state?.outputCurrencyAmount

  return useMemo(() => {
    if (!outputCurrencyAmount) return null

    return !!protocolFeeBps && protocolFeeBps > 0
      ? outputCurrencyAmount.multiply(bpsToPercent(protocolFeeBps))
      : CurrencyAmount.fromRawAmount(outputCurrencyAmount.currency, 0)
  }, [outputCurrencyAmount, protocolFeeBps])
}

