import { useMemo } from 'react'

import { bpsToPercent } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useWidgetPartnerFee } from 'modules/injectedWidget'
import { useDerivedTradeState } from 'modules/trade'

export function useLimitOrderPartnerFeeAmount(): CurrencyAmount<Currency> | null {
  const state = useDerivedTradeState()
  const partnerFee = useWidgetPartnerFee()

  return useMemo(() => {
    const outputCurrencyAmount = state?.outputCurrencyAmount
    if (!outputCurrencyAmount || !partnerFee) return null

    const { bps: partnerFeeBps } = partnerFee

    return partnerFeeBps > 0
      ? outputCurrencyAmount.multiply(bpsToPercent(partnerFeeBps))
      : CurrencyAmount.fromRawAmount(outputCurrencyAmount.currency, 0)
  }, [state, partnerFee])
}
