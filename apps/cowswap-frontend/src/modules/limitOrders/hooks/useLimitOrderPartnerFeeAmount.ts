import { useMemo } from 'react'

import { bpsToPercent } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useDerivedTradeState } from 'modules/trade'
import { useVolumeFee } from 'modules/volumeFee'

import { useLimitOrderProtocolFeeAmount } from './useLimitOrderProtocolFeeAmount'

export function useLimitOrderPartnerFeeAmount(): CurrencyAmount<Currency> | null {
  const state = useDerivedTradeState()
  const { volumeBps } = useVolumeFee() || {}
  const outputCurrencyAmount = state?.outputCurrencyAmount
  const protocolFeeAmount = useLimitOrderProtocolFeeAmount()

  return useMemo(() => {
    if (!outputCurrencyAmount) return null

    // Partner fee is applied after a protocol fee (outputCurrencyAmount - protocolFee)
    const amountAfterProtocolFee =
      protocolFeeAmount && !protocolFeeAmount.equalTo(0)
        ? outputCurrencyAmount.subtract(protocolFeeAmount)
        : outputCurrencyAmount

    return !!volumeBps && volumeBps > 0
      ? amountAfterProtocolFee.multiply(bpsToPercent(volumeBps))
      : CurrencyAmount.fromRawAmount(outputCurrencyAmount.currency, 0)
  }, [outputCurrencyAmount, volumeBps, protocolFeeAmount])
}
