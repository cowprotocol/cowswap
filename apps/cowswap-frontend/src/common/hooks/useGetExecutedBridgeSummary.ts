/* eslint-disable no-restricted-imports */ // TODO: Don't use 'modules' import
import { useMemo } from 'react'

import { Order } from 'legacy/state/orders/actions'

import { useTryFindIntermediateTokenInTokensMap } from 'modules/trade'

import {
  ExecutedSummaryData,
  getExecutedSummaryData,
  getExecutedSummaryDataWithSurplusToken,
} from 'utils/getExecutedSummaryData'

export function useGetExecutedBridgeSummary(order: Order | undefined): ExecutedSummaryData | undefined {
  const intermediateToken = useTryFindIntermediateTokenInTokensMap(order)

  return useMemo(() => {
    if (!order) return undefined

    return intermediateToken
      ? getExecutedSummaryDataWithSurplusToken(order, intermediateToken)
      : getExecutedSummaryData(order)
  }, [order, intermediateToken])
}
