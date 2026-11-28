import type { Order } from 'legacy/state/orders/actions'

import { getAppDataValidFrom } from 'modules/appData'

/**
 * Batch start already stored on a placed order.
 * The live schedule atom is not used: it can move on to a later batch than the one this order joined.
 */
export function useOrderValidFrom(order: Order | undefined): number | undefined {
  const apiValidFrom = order?.apiAdditionalInfo?.validFrom

  if (isFiniteTimestamp(apiValidFrom)) {
    return apiValidFrom
  }

  const snapshot = order?.waitAndSaveNextBatch
  if (isFiniteTimestamp(snapshot)) {
    return snapshot
  }

  return getAppDataValidFrom(order?.fullAppData)
}

function isFiniteTimestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}
