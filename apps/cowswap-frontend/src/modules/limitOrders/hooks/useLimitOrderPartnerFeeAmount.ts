import { useMemo } from 'react'

import { bpsToPercent } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useDerivedTradeState } from 'modules/trade'
import { useVolumeFee } from 'modules/volumeFee'

export function useLimitOrderPartnerFeeAmount(): CurrencyAmount<Currency> | null {
  const state = useDerivedTradeState()
  const volumeFee = useVolumeFee()
  const outputCurrencyAmount = state?.outputCurrencyAmount

  return useMemo(() => {
    if (!outputCurrencyAmount) return null

    return !!volumeFee?.bps && volumeFee.bps > 0
      ? outputCurrencyAmount.multiply(bpsToPercent(volumeFee.bps))
      : CurrencyAmount.fromRawAmount(outputCurrencyAmount.currency, 0)
  }, [outputCurrencyAmount, volumeFee])
}
