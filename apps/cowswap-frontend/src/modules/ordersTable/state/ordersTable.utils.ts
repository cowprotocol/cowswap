import { cowSwapStore } from 'legacy/state'
import {
  SetIsOrderUnfillableParams,
  setIsOrderUnfillable as createSetIsOrderUnfillableAction,
} from 'legacy/state/orders/actions'

const ENABLE_ORDERS_TABLE_DEBUG = false

/**
 * Debug logging for orders table.
 */
export function logOrdersTableDebug(message: string, ...optionalParams: unknown[]): void {
  if (process.env.NODE_ENV === 'development' && ENABLE_ORDERS_TABLE_DEBUG) {
    console.debug(`[OrdersTable] ${message}`, ...optionalParams)
  }
}

export function setIsOrderUnfillable(params: SetIsOrderUnfillableParams): void {
  cowSwapStore.dispatch(createSetIsOrderUnfillableAction(params))
}
