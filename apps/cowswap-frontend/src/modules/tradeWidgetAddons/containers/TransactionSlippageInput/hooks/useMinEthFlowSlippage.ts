import { useMemo } from 'react'

import { MINIMUM_ETH_FLOW_SLIPPAGE, MINIMUM_ETH_FLOW_SLIPPAGE_BPS } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Percent } from '@uniswap/sdk-core'


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
