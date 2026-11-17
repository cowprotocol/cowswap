import type { Order } from 'legacy/state/orders/actions'

import { getAppDataValidFrom } from 'modules/appData'

/**
 * Batch start already stored on a placed order.
 * The live schedule atom is not used: it can move on to a later batch than the one this order joined.
 *
 * TODO(backend): for `enableWaitForCow` orders the orderbook must populate `OrderMetaData.validFrom`
 * with the canonical batch the order joined (services #5284: autopilot writes `orders.valid_from`,
 * existing GET order returns it). Until that write is visible on a poll, and until legacy
 * `metadata.validFrom` app-data is gone, a new wait-for-cow order has no batch start here — placement
 * does not put it in app-data, and POST may still return null before the first schedule update.
 */
export function useOrderValidFrom(order: Order | undefined): number | undefined {
  const apiValidFrom = order?.apiAdditionalInfo?.validFrom

  if (typeof apiValidFrom === 'number' && Number.isFinite(apiValidFrom)) {
    return apiValidFrom
  }

  return getAppDataValidFrom(order?.fullAppData)
}
