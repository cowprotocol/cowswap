import { useMemo } from 'react'

import {
  HIGH_ETH_FLOW_SLIPPAGE_BPS,
  HIGH_SLIPPAGE_BPS,
  LOW_SLIPPAGE_BPS,
  MINIMUM_ETH_FLOW_SLIPPAGE_BPS,
} from '@cowprotocol/common-const'
import { Percent } from '@uniswap/sdk-core'

import { useIsEoaEthFlow } from 'modules/trade'
import { slippageBpsToPercent, useSlippageConfig } from 'modules/tradeSlippage'

import { SlippageWarningParams } from './types'

const SMART_SLIPPAGE_THRESHOLD = 0.2 // 20%

export function useSlippageWarningParams(
  swapSlippage: Percent,
  smartSlippage: Percent | null,
  isSlippageModified: boolean,
): SlippageWarningParams | null {
  const isEoaEthFlow = useIsEoaEthFlow()
  const { min, max, defaultValue } = useSlippageConfig()

  const lowSlippageBound = smartSlippage
    ? Math.max(+smartSlippage.multiply(1 - SMART_SLIPPAGE_THRESHOLD).toFixed(2), 0)
    : Math.max(isEoaEthFlow ? MINIMUM_ETH_FLOW_SLIPPAGE_BPS : LOW_SLIPPAGE_BPS, defaultValue)
  const highSlippageBound = smartSlippage
    ? Math.max(+smartSlippage.multiply(1 + SMART_SLIPPAGE_THRESHOLD).toFixed(2), 0)
    : Math.max(isEoaEthFlow ? HIGH_ETH_FLOW_SLIPPAGE_BPS : HIGH_SLIPPAGE_BPS, defaultValue)

  return useMemo(() => {
    if (!isSlippageModified) return null

    const chosenSlippageMatchesSmartSlippage = Boolean(smartSlippage && smartSlippage.equalTo(swapSlippage))

    if (chosenSlippageMatchesSmartSlippage) return null

    const tooLow = swapSlippage.lessThan(new Percent(lowSlippageBound, 10_000))
    const tooHigh = swapSlippage.greaterThan(new Percent(highSlippageBound, 10_000))

    return {
      tooHigh,
      tooLow,
      min: slippageBpsToPercent(min),
      max: slippageBpsToPercent(max),
    }
  }, [isSlippageModified, smartSlippage, swapSlippage, lowSlippageBound, highSlippageBound, min, max])
}
