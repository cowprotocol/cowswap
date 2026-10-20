import type { Order } from 'legacy/state/orders/actions'

import { getAppDataValidFrom } from 'modules/appData'

export function useOrderValidFrom(order: Order | undefined): number | undefined {
  return getAppDataValidFrom(order?.fullAppData)
}
