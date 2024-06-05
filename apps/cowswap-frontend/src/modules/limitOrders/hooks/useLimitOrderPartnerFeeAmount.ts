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
    if (!outputCurrencyAmount) return null

    return !!partnerFee?.bps && partnerFee.bps > 0
      ? outputCurrencyAmount.multiply(bpsToPercent(partnerFee?.bps))
      : CurrencyAmount.fromRawAmount(outputCurrencyAmount.currency, 0)
  }, [state, partnerFee])
}
