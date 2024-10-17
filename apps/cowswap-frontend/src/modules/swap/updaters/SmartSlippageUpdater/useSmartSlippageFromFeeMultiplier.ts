import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { useReceiveAmountInfo } from 'modules/trade'

import { calculateBpsFromFeeMultiplier } from './calculateBpsFromFeeMultiplier'

/**
 * Calculates smart slippage in bps, based on quoted fee
 *
 * Apply a multiplying factor to the fee (e.g.: 50%), and from there calculate how much slippage would be needed
 * for the limit price to take this much more fee.
 * More relevant for small orders in relation to fee amount, negligent for larger orders.
 */
export function useSmartSlippageFromFeeMultiplier(): number | undefined {
  const { beforeNetworkCosts, afterNetworkCosts, costs, isSell } = useReceiveAmountInfo() || {}
  const sellAmount = isSell ? afterNetworkCosts?.sellAmount : beforeNetworkCosts?.sellAmount
  const feeAmount = costs?.networkFee?.amountInSellCurrency

  const { smartSlippageFeeMultiplierPercentage } = useFeatureFlags()

  return useMemo(
    () => calculateBpsFromFeeMultiplier(sellAmount, feeAmount, isSell, smartSlippageFeeMultiplierPercentage),
    [isSell, sellAmount, feeAmount, smartSlippageFeeMultiplierPercentage],
  )
}
