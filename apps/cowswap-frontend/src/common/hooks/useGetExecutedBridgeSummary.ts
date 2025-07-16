import { useMemo } from 'react'

import { Order } from 'legacy/state/orders/actions'

import { useGetIntermediateSellTokenIfExists } from 'modules/trade/hooks/useGetIntermediateSellTokenIfExists'

import {
  ExecutedSummaryData, getExecutedSummaryData,
  getExecutedSummaryDataWithSurplusToken
} from 'utils/getExecutedSummaryData'




export function useGetExecutedBridgeSummary(order: Order | undefined): ExecutedSummaryData | undefined {
  const intermediateToken = useGetIntermediateSellTokenIfExists(order)

  return useMemo(() => {
    if (!order) return undefined

    return intermediateToken
      ? getExecutedSummaryDataWithSurplusToken(order, intermediateToken)
      : getExecutedSummaryData(order)
  }, [order, intermediateToken])
}
