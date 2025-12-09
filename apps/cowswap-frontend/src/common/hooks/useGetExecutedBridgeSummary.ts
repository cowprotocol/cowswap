import { useMemo } from 'react'

import { useTokenByAddress } from '@cowprotocol/tokens'

import { Order } from 'legacy/state/orders/actions'

import {
  ExecutedSummaryData,
  getExecutedSummaryData,
  getExecutedSummaryDataWithSurplusToken,
} from 'utils/getExecutedSummaryData'

export function useGetExecutedBridgeSummary(order: Order | undefined): ExecutedSummaryData | undefined {
  const intermediateToken = useTokenByAddress(order?.buyToken)

  return useMemo(() => {
    if (!order) return undefined

    return intermediateToken
      ? getExecutedSummaryDataWithSurplusToken(order, intermediateToken)
      : getExecutedSummaryData(order)
  }, [order, intermediateToken])
}
