import { useMemo } from 'react'

import { ETH_FLOW_SLIPPAGE_WARNING_THRESHOLD } from '@cowprotocol/common-const'
import { percentToBps } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useIsCurrentTradeBridging, useIsEoaEthFlow } from 'modules/trade'

import { useIsSlippageModified } from './useIsSlippageModified'
import { useTradeSlippage } from './useTradeSlippage'

/**
 * Slippage warning threshold for regular ERC20 orders
 * Show slippage prominently when > 2%
 */
const REGULAR_ORDER_SLIPPAGE_WARNING_BPS = 200 // 2%

/**
 * Hook to determine if slippage should be displayed prominently (outside the accordion)
 * 
 * Slippage should be prominent when:
 * 1. User has manually modified the slippage value, OR
 * 2. Slippage exceeds warning thresholds (>2%)
 * 
 * EXCEPT: Never show prominently for Bridge orders
 * 
 * Note: When accordion is expanded, prominent slippage is hidden to avoid duplication
 * 
 * @returns {boolean} true if slippage should be shown outside the accordion
 */
export function useShouldShowSlippageProminent(): boolean {
  const { chainId } = useWalletInfo()
  const slippage = useTradeSlippage()
  const isSlippageModified = useIsSlippageModified()
  const isEoaEthFlow = useIsEoaEthFlow()
  const isCurrentTradeBridging = useIsCurrentTradeBridging()

  return useMemo(() => {
    // Never show prominently for Bridge orders
    if (isCurrentTradeBridging) {
      return false
    }

    const slippageBps = percentToBps(slippage)

    // Determine the warning threshold based on order type
    let warningThresholdBps: number

    if (isEoaEthFlow) {
      // For ETH-flow orders, use 2% threshold
      warningThresholdBps = ETH_FLOW_SLIPPAGE_WARNING_THRESHOLD[chainId]
    } else {
      // For regular ERC20 orders, use 2% threshold
      warningThresholdBps = REGULAR_ORDER_SLIPPAGE_WARNING_BPS
    }

    // Show prominently when:
    // 1. User manually modified slippage, OR
    // 2. Slippage exceeds threshold (>2%)
    const shouldShowDueToHighSlippage = slippageBps > warningThresholdBps
    
    return isSlippageModified || shouldShowDueToHighSlippage
  }, [chainId, slippage, isSlippageModified, isEoaEthFlow, isCurrentTradeBridging])
}

