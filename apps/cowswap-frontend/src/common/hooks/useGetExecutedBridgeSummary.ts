import { useMemo } from 'react'

import { Order } from 'legacy/state/orders/actions'

import {
  ExecutedSummaryData, getExecutedSummaryData,
  getExecutedSummaryDataWithSurplusToken
} from 'utils/getExecutedSummaryData'

// todo
import { useGetIntermediateTokenIfExists } from '../../modules/trade/hooks/useGetIntermediateTokenIfExists'

export function useGetExecutedBridgeSummary(order: Order | undefined): ExecutedSummaryData | undefined {
  const intermediateToken = useGetIntermediateTokenIfExists(order)

  return useMemo(() => {
    if (!order) return undefined

    return intermediateToken
      ? getExecutedSummaryDataWithSurplusToken(order, intermediateToken)
      : getExecutedSummaryData(order)
  }, [order, intermediateToken])
}
