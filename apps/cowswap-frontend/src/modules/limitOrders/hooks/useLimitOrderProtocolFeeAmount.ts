import { useMemo } from 'react'

import { bpsToPercent } from '@cowprotocol/common-utils'
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

    // Example:
    // output * 2bps = output * 0.02% = output * 0.0002

    return !!protocolFeeBps && protocolFeeBps > 0
      ? outputCurrencyAmount
          .multiply(bpsToPercent(protocolFeeBps).multiply(PROTOCOL_FEE_SCALE))
          .divide(PROTOCOL_FEE_SCALE)
      : CurrencyAmount.fromRawAmount(outputCurrencyAmount.currency, 0)
  }, [outputCurrencyAmount, protocolFeeBps])
}
