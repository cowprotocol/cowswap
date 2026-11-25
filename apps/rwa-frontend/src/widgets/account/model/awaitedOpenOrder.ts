import { atom } from 'jotai'

import type { OpenOrder } from '../api/openOrders'

export interface AwaitedOpenOrder {
  /** Order UID, or the ComposableCoW order hash for a TWAP */
  id: string
  /** ms */
  until: number
}

/** A posted order the open orders are refetched quickly for, until it is listed */
export const awaitedOpenOrderAtom = atom<AwaitedOpenOrder | null>(null)

export function isAwaitingOpenOrder(awaited: AwaitedOpenOrder | null, orders: OpenOrder[] | undefined): boolean {
  if (!awaited || Date.now() > awaited.until) return false

  return !orders?.some(({ uid, cowShedTwap }) => uid === awaited.id || cowShedTwap?.hash === awaited.id)
}
