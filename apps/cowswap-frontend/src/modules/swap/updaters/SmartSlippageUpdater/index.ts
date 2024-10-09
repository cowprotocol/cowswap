import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { useTradeConfirmState } from 'modules/trade'

import { useSmartSlippageFromBff } from './useSmartSlippageFromBff'
import { useSmartSlippageFromFeeMultiplier } from './useSmartSlippageFromFeeMultiplier'

import { useDerivedSwapInfo, useHighFeeWarning } from '../../hooks/useSwapState'
import { smartSwapSlippageAtom } from '../../state/slippageValueAndTypeAtom'

const MAX_BPS = 500 // 5%
const MIN_BPS = 50 // 0.5%

export function SmartSlippageUpdater() {
  const setSmartSwapSlippage = useSetAtom(smartSwapSlippageAtom)

  const bffSlippageBps = useSmartSlippageFromBff()
  // TODO: remove v1
  const tradeSizeSlippageBpsV1 = useSmartSlippageFromFeePercentage()
  const feeMultiplierSlippageBps = useSmartSlippageFromFeeMultiplier()

  const { isOpen: isTradeReviewOpen } = useTradeConfirmState()

  useEffect(() => {
    // Don't update it once review is open
    if (isTradeReviewOpen) {
      return
    }
    // If both are unset, don't use smart slippage
    if (feeMultiplierSlippageBps === undefined && bffSlippageBps === undefined) {
      setSmartSwapSlippage(null)
      return
    }
    // Add both slippage values, when present
    const slippage = (feeMultiplierSlippageBps || 0) + (bffSlippageBps || 0)

    setSmartSwapSlippage(Math.max(MIN_BPS, Math.min(slippage, MAX_BPS)))
  }, [bffSlippageBps, setSmartSwapSlippage, feeMultiplierSlippageBps, isTradeReviewOpen])

  // TODO: remove before merging
  useEffect(() => {
    console.log(`SmartSlippageUpdater`, {
      granularSlippage: tradeSizeSlippageBpsV1,
      fiftyPercentFeeSlippage: feeMultiplierSlippageBps,
      bffSlippageBps,
    })
  }, [tradeSizeSlippageBpsV1, feeMultiplierSlippageBps])

  return null
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
