import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Fraction, TradeType } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import useSWR from 'swr'

import { useDerivedTradeState, useIsWrapOrUnwrap } from 'modules/trade'

import { useDerivedSwapInfo, useHighFeeWarning } from '../hooks/useSwapState'
import { smartSwapSlippageAtom } from '../state/slippageValueAndTypeAtom'

const SWR_OPTIONS = {
  dedupingInterval: ms`1m`,
}

interface SlippageApiResponse {
  slippageBps: number
}

export function SmartSlippageUpdater() {
  const { isSmartSlippageEnabled } = useFeatureFlags()
  const { chainId } = useWalletInfo()
  const { inputCurrency, outputCurrency } = useDerivedTradeState() || {}
  const setSmartSwapSlippage = useSetAtom(smartSwapSlippageAtom)
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  const sellTokenAddress = inputCurrency && getCurrencyAddress(inputCurrency).toLowerCase()
  const buyTokenAddress = outputCurrency && getCurrencyAddress(outputCurrency).toLowerCase()

  const bffSlippageBps = useSWR(
    !sellTokenAddress || !buyTokenAddress || isWrapOrUnwrap || !isSmartSlippageEnabled
      ? null
      : [chainId, sellTokenAddress, buyTokenAddress],
    async ([chainId, sellTokenAddress, buyTokenAddress]) => {
      const url = `${BFF_BASE_URL}/${chainId}/markets/${sellTokenAddress}-${buyTokenAddress}/slippageTolerance`

      const response: SlippageApiResponse = await fetch(url).then((res) => res.json())

      return response.slippageBps
    },
    SWR_OPTIONS,
  ).data

  // TODO: remove v1
  const tradeSizeSlippageBpsV1 = useSmartSlippageFromFeePercentage()
  const tradeSizeSlippageBps = useSmartSlippageFromFeePercentageV2()

  useEffect(() => {
    // If both are unset, don't use smart slippage
    if (tradeSizeSlippageBps === undefined && bffSlippageBps === undefined) {
      return
    }
    // Add both slippage values, when present
    const slippage = (tradeSizeSlippageBps || 0) + (bffSlippageBps || 0)

    setSmartSwapSlippage(slippage)
  }, [bffSlippageBps, setSmartSwapSlippage, tradeSizeSlippageBps])

  // TODO: remove before merging
  useEffect(() => {
    console.log(`SmartSlippageUpdater`, {
      granularSlippage: tradeSizeSlippageBpsV1,
      fiftyPercentFeeSlippage: tradeSizeSlippageBps,
      bffSlippageBps,
    })
  }, [tradeSizeSlippageBpsV1, tradeSizeSlippageBps])

  return null
}

const ONE = new Fraction(1)
const MAX_BPS = 5000 // 50%

/**
 * Calculates smart slippage in bps, based on quoted fee
 *
 * Apply a multiplying factor to the fee (e.g.: 50%), and from there calculate how much slippage would be needed
 * for the limit price to take this much more fee.
 * More relevant for small orders in relation to fee amount, negligent for larger orders.
 */
function useSmartSlippageFromFeePercentageV2(): number | undefined {
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

// TODO: remove
/**
 * Calculates smart slippage in bps, based on trade size in relation to fee
 */
function useSmartSlippageFromFeePercentage(): number | undefined {
  const { trade } = useDerivedSwapInfo() || {}
  const { feePercentage } = useHighFeeWarning(trade)

  const percentage = feePercentage && +feePercentage.toFixed(3)

  return useMemo(() => {
    if (percentage === undefined) {
      // Unset, return undefined
      return
    }
    if (percentage < 1) {
      // bigger volume compared to the fee, trust on smart slippage from BFF
      return
    } else if (percentage < 5) {
      // Between 1 and 5, 2%
      return 200
    } else if (percentage < 10) {
      // Between 5 and 10, 5%
      return 500
    } else if (percentage < 20) {
      // Between 10 and 20, 10%
      return 1000
    }
    // TODO: more granularity?

    // > 20%, cap it at 20% slippage
    return 2000
  }, [percentage])
}
