import { useMemo } from 'react'

import { getWrappedToken, isSellOrder } from '@cowprotocol/common-utils'
import { useTokensByAddressMap } from '@cowprotocol/tokens'

import { Order } from 'legacy/state/orders/actions'

import {
  ExecutedSummaryData,
  getExecutedSummaryData,
  getExecutedSummaryDataWithSurplusToken
} from 'utils/getExecutedSummaryData'

export function useGetExecutedBridgeSummary(order: Order | undefined): ExecutedSummaryData | undefined {
  const useTokensByAddress = useTokensByAddressMap()

  return useMemo(() => {
    if (!order) return undefined

    const intermediateTokenAddress = isSellOrder(order.kind) ? order.buyToken : order.sellToken
    const tokenInMap = useTokensByAddress[intermediateTokenAddress.toLowerCase()]
    if (!tokenInMap) return getExecutedSummaryData(order) // fallback to the original function if token is not found
    const intermediateToken = tokenInMap.isNative
      ? getWrappedToken(tokenInMap)
      : tokenInMap


    return getExecutedSummaryDataWithSurplusToken(order, intermediateToken)
  }, [order, useTokensByAddress])
}
