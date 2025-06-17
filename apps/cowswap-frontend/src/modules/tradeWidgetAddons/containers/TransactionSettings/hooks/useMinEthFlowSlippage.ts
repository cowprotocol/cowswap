import { useWalletInfo } from '@cowprotocol/wallet'
import { MINIMUM_ETH_FLOW_SLIPPAGE, MINIMUM_ETH_FLOW_SLIPPAGE_BPS } from '@cowprotocol/common-const'
import { Percent } from '@uniswap/sdk-core'
import { useMemo } from 'react'

export function useMinEthFlowSlippage(): {
  minEthFlowSlippageBps: number
  minEthFlowSlippage: Percent
} {
  const { chainId } = useWalletInfo()

  return useMemo(() => ({
    minEthFlowSlippageBps: MINIMUM_ETH_FLOW_SLIPPAGE_BPS[chainId],
    minEthFlowSlippage: MINIMUM_ETH_FLOW_SLIPPAGE[chainId]
  }), [chainId])
}
