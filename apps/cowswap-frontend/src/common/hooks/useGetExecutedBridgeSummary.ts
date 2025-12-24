  // TODO: Don't use 'modules' import
import { useMemo } from 'react'

import { useTokenByAddress } from '@cowprotocol/tokens'

import { Order } from 'legacy/state/orders/actions'

import { ExecutedSummaryData, getExecutedSummaryData } from 'utils/getExecutedSummaryData'

export function useGetExecutedBridgeSummary(order: Order | undefined): ExecutedSummaryData | undefined {
  const intermediateToken = useTokenByAddress(order?.buyToken)

  return useMemo(() => {
    if (!order) return undefined

    /**
     * In case of cross-chain swap, order.buyToken will be a destination chain token
     * [input token] WETH (Ethereum) -> [intermediate token] USDC (Ethereum) -> [output token] xDai (Gnosis)
     * In the example above, order.buyToken will be xDai (Gnosis)
     * To make getExecutedSummaryData() processing cross-chain orders properly,
     * we override surplus token and order.outputToken
     */
    return getExecutedSummaryData(order, intermediateToken)
  }, [order, intermediateToken])
}
