import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { Fraction, TradeType } from '@uniswap/sdk-core'

import { useDerivedSwapInfo } from '../../hooks/useSwapState'

const ONE = new Fraction(1)
const MAX_BPS = 5000 // 50%

/**
 * Calculates smart slippage in bps, based on quoted fee
 *
 * Apply a multiplying factor to the fee (e.g.: 50%), and from there calculate how much slippage would be needed
 * for the limit price to take this much more fee.
 * More relevant for small orders in relation to fee amount, negligent for larger orders.
 */
export function useSmartSlippageFromFeeMultiplier(): number | undefined {
  const { trade } = useDerivedSwapInfo() || {}
  const { fee, inputAmountWithFee, inputAmountWithoutFee, tradeType } = trade || {}
  const { feeAsCurrency } = fee || {}
  const { smartSlippageFeeMultiplierPercentage = 0 } = useFeatureFlags()
  const feeMultiplierFactor = new Fraction(100 + smartSlippageFeeMultiplierPercentage, 100) // 50% more fee, applied to the whole value => 150% => 15/10 in fraction

  const percentage = useMemo(() => {
    if (
      !inputAmountWithFee ||
      !inputAmountWithoutFee ||
      !feeAsCurrency ||
      tradeType === undefined ||
      !smartSlippageFeeMultiplierPercentage
    ) {
      return undefined
    }

    if (tradeType === TradeType.EXACT_INPUT) {
      // sell
      // 1 - (sellAmount - feeAmount * 1.5) / (sellAmount - feeAmount)
      // 1 - (inputAmountWithoutFee - feeAsCurrency * feeMultiplierFactor) / inputAmountWithFee
      return ONE.subtract(
        inputAmountWithoutFee
          .subtract(feeAsCurrency.multiply(feeMultiplierFactor))
          // !!! Need to convert to fraction before division to not lose precision
          .asFraction.divide(inputAmountWithFee.asFraction),
      )
    } else {
      // buy
      // (sellAmount + feeAmount * 1.5) / (sellAmount + feeAmount) - 1
      // (inputAmountWithFee + feeAsCurrency * feeMultiplierFactor) / inputAmountWithFee - 1
      return (
        inputAmountWithFee
          .add(feeAsCurrency.multiply(feeMultiplierFactor))
          // !!! Need to convert to fraction before division to not lose precision
          .asFraction.divide(inputAmountWithFee.asFraction)
          .subtract(ONE)
      )
    }
  }, [tradeType, inputAmountWithFee, inputAmountWithoutFee, feeAsCurrency, smartSlippageFeeMultiplierPercentage])

  // Stable reference
  // convert % to BPS. E.g.: 1% => 0.01 => 100 BPS
  const bps = percentage?.multiply(10_000).toFixed(0)

  return useMemo(() => {
    if (bps) {
      // Cap it at MAX_BPS
      return Math.min(+bps, MAX_BPS)
    } else {
      return undefined
    }
  }, [bps])
}
