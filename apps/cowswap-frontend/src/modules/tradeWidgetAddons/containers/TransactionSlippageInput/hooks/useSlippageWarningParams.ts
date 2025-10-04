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

const SMART_SLIPPAGE_THRESHOLD = 20 // 20%
const PERCENT_DENOMINATOR = 10_000

export function useSlippageWarningParams(
  swapSlippage: Percent,
  smartSlippage: number | null,
  isSlippageModified: boolean,
): SlippageWarningParams | null {
  const isEoaEthFlow = useIsEoaEthFlow()
  const { min, max, defaultValue } = useSlippageConfig()

  /**
   * When smartSlippage, then take smartSlippage - 20%
   * Otherwise, take a CONST (eth/regular flow) or at least defaultValue
   */
  const lowSlippageBound = smartSlippage
    ? Math.ceil((smartSlippage * (100 - SMART_SLIPPAGE_THRESHOLD)) / 100)
    : Math.max(isEoaEthFlow ? MINIMUM_ETH_FLOW_SLIPPAGE_BPS : LOW_SLIPPAGE_BPS, defaultValue)

  /**
   * When smartSlippage, then take smartSlippage + 20%
   * Otherwise, take a CONST (eth/regular flow) or at least defaultValue
   */
  const highSlippageBound = smartSlippage
    ? Math.ceil((smartSlippage * (100 + SMART_SLIPPAGE_THRESHOLD)) / 100)
    : Math.max(isEoaEthFlow ? HIGH_ETH_FLOW_SLIPPAGE_BPS : HIGH_SLIPPAGE_BPS, defaultValue)

  return useMemo(() => {
    if (!isSlippageModified) return null

    const chosenSlippageMatchesSmartSlippage = Boolean(
      smartSlippage && swapSlippage.equalTo(new Percent(smartSlippage, PERCENT_DENOMINATOR)),
    )

    if (chosenSlippageMatchesSmartSlippage) return null

    const tooLow = swapSlippage.lessThan(new Percent(lowSlippageBound, PERCENT_DENOMINATOR))
    const tooHigh = swapSlippage.greaterThan(new Percent(highSlippageBound, PERCENT_DENOMINATOR))

    return {
      tooHigh,
      tooLow,
      min: slippageBpsToPercent(min),
      max: slippageBpsToPercent(max),
    }
  }, [isSlippageModified, smartSlippage, swapSlippage, lowSlippageBound, highSlippageBound, min, max])
}
