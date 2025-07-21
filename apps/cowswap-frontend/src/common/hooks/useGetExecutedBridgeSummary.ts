import { useMemo } from 'react'

import { Order } from 'legacy/state/orders/actions'

import {
  ExecutedSummaryData, getExecutedSummaryData,
  getExecutedSummaryDataWithSurplusToken
} from 'utils/getExecutedSummaryData'

import { useGetIntermediateSellTokenFromOrder } from '../../modules/trade/hooks/useGetIntermediateSellTokenFromOrder'





export function useGetExecutedBridgeSummary(order: Order | undefined): ExecutedSummaryData | undefined {
  const intermediateToken = useGetIntermediateSellTokenFromOrder(order)

  return useMemo(() => {
    if (!order) return undefined

    return intermediateToken
      ? getExecutedSummaryDataWithSurplusToken(order, intermediateToken)
      : getExecutedSummaryData(order)
  }, [order, intermediateToken])
}
