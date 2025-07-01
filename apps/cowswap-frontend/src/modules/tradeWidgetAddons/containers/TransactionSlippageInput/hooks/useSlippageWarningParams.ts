import { useMemo } from 'react'

import { HIGH_ETH_FLOW_SLIPPAGE_BPS, HIGH_SLIPPAGE_BPS, LOW_SLIPPAGE_BPS } from '@cowprotocol/common-const'
import { Percent } from '@uniswap/sdk-core'

import { useIsEoaEthFlow } from 'modules/trade'
import { slippageBpsToPercent, useSlippageConfig } from 'modules/tradeSlippage'

import { useMinEthFlowSlippage } from './useMinEthFlowSlippage'

export function useSlippageWarningParams(
  swapSlippage: Percent,
  smartSlippage: number | null,
  isSlippageModified: boolean
): { tooHigh: boolean; tooLow: boolean; min: number; max: number } {
  const isEoaEthFlow = useIsEoaEthFlow()
  const { minEthFlowSlippageBps } = useMinEthFlowSlippage()
  const { min, max, defaultValue } = useSlippageConfig()

  const lowSlippageBound = isSlippageModified
    ? isEoaEthFlow ? minEthFlowSlippageBps : LOW_SLIPPAGE_BPS
    : defaultValue

  const highModifiedSlippage = isEoaEthFlow
    ? smartSlippage || HIGH_ETH_FLOW_SLIPPAGE_BPS
    : smartSlippage || HIGH_SLIPPAGE_BPS;

  const highSlippageBound = isSlippageModified
    ? highModifiedSlippage < defaultValue ? defaultValue : highModifiedSlippage
    : defaultValue

  return useMemo(() => {
    const tooLow = swapSlippage.lessThan(new Percent(lowSlippageBound, 10_000))

    const tooHigh = swapSlippage.greaterThan(
      new Percent(highSlippageBound, 10_000),
    )

    return {
      tooHigh,
      tooLow,
      min: slippageBpsToPercent(min),
      max: slippageBpsToPercent(max)
    }
  }, [
    swapSlippage,
    lowSlippageBound,
    highSlippageBound,
    min,
    max
  ])
}
