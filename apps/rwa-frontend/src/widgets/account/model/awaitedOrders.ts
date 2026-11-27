import { atom } from 'jotai'

import { areAddressesEqual } from '@cowprotocol/cow-sdk'

import type { Activity } from '../api/activity'
import type { OpenOrder } from '../api/openOrders'

export interface AwaitedOrder {
  /** Order UID, or the ComposableCoW order hash for a TWAP */
  id: string
  /** The connected wallet that placed the order */
  owner: string
  /** `AccountQueryParams.scope` of the lists the order is awaited in */
  scope: string
  /** ms */
  until: number
}

interface AwaitedOrderTarget {
  owner: string
  scope: string
}

/** A posted order the open orders are refetched quickly for, until it is listed */
export const awaitedOpenOrderAtom = atom<AwaitedOrder | null>(null)

/** A filled order the activity is refetched quickly for, until its trade is listed */
export const awaitedActivityOrderAtom = atom<AwaitedOrder | null>(null)

export function isAwaitingActivityOrder(
  awaited: AwaitedOrder | null,
  target: AwaitedOrderTarget,
  activity: Activity[] | undefined,
): boolean {
  if (!isAwaitedIn(awaited, target)) return false

  return !activity?.some(({ orderUid }) => orderUid === awaited.id)
}

export function isAwaitingOpenOrder(
  awaited: AwaitedOrder | null,
  target: AwaitedOrderTarget,
  orders: OpenOrder[] | undefined,
): boolean {
  if (!isAwaitedIn(awaited, target)) return false

  return !orders?.some(({ uid, cowShedTwap }) => uid === awaited.id || cowShedTwap?.hash === awaited.id)
}

function isAwaitedIn(awaited: AwaitedOrder | null, { owner, scope }: AwaitedOrderTarget): awaited is AwaitedOrder {
  if (!awaited || Date.now() > awaited.until) return false

  return awaited.scope === scope && areAddressesEqual(awaited.owner, owner)
}
