import { useMemo } from 'react'

import { ETH_FLOW_SLIPPAGE_WARNING_THRESHOLD } from '@cowprotocol/common-const'
import { percentToBps } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useIsEoaEthFlow } from 'modules/trade'

import { useIsSlippageModified } from './useIsSlippageModified'
import { useTradeSlippage } from './useTradeSlippage'

/**
 * Slippage warning threshold for regular ERC20 orders
 * Show slippage prominently when > 2%
 */
const REGULAR_ORDER_SLIPPAGE_WARNING_BPS = 200 // 2%

/**
 * Slippage warning threshold for ETH-flow orders on Mainnet
 * Show slippage prominently when > 5%
 */
const MAINNET_ETH_FLOW_SLIPPAGE_WARNING_BPS = 500 // 5%

/**
 * Hook to determine if slippage should be displayed prominently (outside the accordion)
 * 
 * Slippage should be prominent when:
 * 1. User has manually modified the slippage value
 * 2. Slippage exceeds warning thresholds:
 *    - For regular orders: > 2%
 *    - For ETH-flow orders on Mainnet: > 5%
 *    - For ETH-flow orders on other chains: uses ETH_FLOW_SLIPPAGE_WARNING_THRESHOLD
 * 
 * @returns {boolean} true if slippage should be shown outside the accordion
 */
export function useShouldShowSlippageProminent(): boolean {
  const { chainId } = useWalletInfo()
  const slippage = useTradeSlippage()
  const isSlippageModified = useIsSlippageModified()
  const isEoaEthFlow = useIsEoaEthFlow()

  return useMemo(() => {
    // Always show prominently when user has manually modified slippage
    if (isSlippageModified) {
      return true
    }

    const slippageBps = percentToBps(slippage)

    // Determine the warning threshold based on order type and chain
    let warningThresholdBps: number

    if (isEoaEthFlow) {
      // For ETH-flow orders on Mainnet, use 5% threshold
      if (chainId === SupportedChainId.MAINNET) {
        warningThresholdBps = MAINNET_ETH_FLOW_SLIPPAGE_WARNING_BPS
      } else {
        // For other chains, use the default ETH-flow threshold
        warningThresholdBps = ETH_FLOW_SLIPPAGE_WARNING_THRESHOLD[chainId]
      }
    } else {
      // For regular ERC20 orders, use 2% threshold
      warningThresholdBps = REGULAR_ORDER_SLIPPAGE_WARNING_BPS
    }

    // Show prominently if slippage exceeds the threshold
    return slippageBps > warningThresholdBps
  }, [chainId, slippage, isSlippageModified, isEoaEthFlow])
}

