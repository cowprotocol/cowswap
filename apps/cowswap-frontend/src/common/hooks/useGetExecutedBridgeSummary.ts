import { useMemo } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { useTokensByAddressMap } from '@cowprotocol/tokens'

import { Order } from 'legacy/state/orders/actions'

import {
  ExecutedSummaryData,
  getExecutedSummaryData,
  getExecutedSummaryDataWithSurplusToken
} from 'utils/getExecutedSummaryData'

export function useGetExecutedBridgeSummary(order: Order | undefined): ExecutedSummaryData | undefined {
  const tokensByAddress = useTokensByAddressMap()

  return useMemo(() => {
    if (!order) return undefined

    // bridge orders are always sell orders
    const intermediateTokenAddress = order.buyToken
    const tokenInMap = tokensByAddress[intermediateTokenAddress.toLowerCase()]
    if (!tokenInMap) return getExecutedSummaryData(order) // fallback to the original function if token is not found
    const intermediateToken = tokenInMap.isNative
      ? getWrappedToken(tokenInMap)
      : tokenInMap

    return getExecutedSummaryDataWithSurplusToken(order, intermediateToken)
  }, [order, tokensByAddress])
}
