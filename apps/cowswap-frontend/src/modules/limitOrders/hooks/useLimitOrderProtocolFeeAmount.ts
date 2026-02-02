import { useMemo } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useDerivedTradeState } from 'modules/trade'
import { useTradeQuoteProtocolFee } from 'modules/tradeQuote'

import { PROTOCOL_FEE_SCALE } from 'common/constants/common'

export function useLimitOrderProtocolFeeAmount(): CurrencyAmount<Currency> | null {
  const state = useDerivedTradeState()
  const protocolFeeBps = useTradeQuoteProtocolFee()
  const outputCurrencyAmount = state?.outputCurrencyAmount

  return useMemo(() => {
    if (!outputCurrencyAmount) return null

    return !!protocolFeeBps && protocolFeeBps > 0
      ? outputCurrencyAmount.multiply(protocolFeeBps * PROTOCOL_FEE_SCALE).divide(PROTOCOL_FEE_SCALE)
      : CurrencyAmount.fromRawAmount(outputCurrencyAmount.currency, 0)
  }, [outputCurrencyAmount, protocolFeeBps])
}
