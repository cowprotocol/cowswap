import type { Query } from '@tanstack/react-query'

import { areAddressesEqual, getAddressKey } from '@cowprotocol/cow-sdk'

import { atomFamily } from 'jotai-family'
import { atomWithQuery } from 'jotai-tanstack-query'

import {
  awaitedActivityOrderAtom,
  awaitedOpenOrderAtom,
  isAwaitingActivityOrder,
  isAwaitingOpenOrder,
} from './awaitedOrders'
import { orderCancellationsAtom } from './orderCancellations'

import { type Activity, activityProvider } from '../api/activity'
import { getOpenOrders, type OpenOrder } from '../api/openOrders'

import type { RwaTokenSummary } from '@/entities/asset'

import { RWA_QUERY_KEY_ROOT } from '@/shared/api'

export interface AccountQueryParams {
  owner: string
  /** Identifies `tokens` in the query key, e.g. an asset ticker */
  scope: string
  tokens: RwaTokenSummary[]
}

const OPEN_ORDERS_REFRESH_INTERVAL_MS = 15_000
const AWAITED_OPEN_ORDER_REFRESH_INTERVAL_MS = 2_000
const ACTIVITY_REFRESH_INTERVAL_MS = 60_000
const AWAITED_ACTIVITY_REFRESH_INTERVAL_MS = 2_000
const ACTIVITY_LIMIT = 50

function areParamsEqual(a: AccountQueryParams, b: AccountQueryParams): boolean {
  return areAddressesEqual(a.owner, b.owner) && a.scope === b.scope
}

export const openOrdersQueryAtomFamily = atomFamily(
  ({ owner, scope, tokens }: AccountQueryParams) =>
    atomWithQuery((get) => {
      const cancellations = get(orderCancellationsAtom)
      const awaited = get(awaitedOpenOrderAtom)

      return {
        queryKey: [RWA_QUERY_KEY_ROOT, 'open-orders', getAddressKey(owner), scope],
        queryFn: () => getOpenOrders({ owner, tokens }),
        // The TWAP indexer notices a cancellation up to 100 blocks late: ComposableCoW.remove() emits no event
        select: (orders: OpenOrder[]) => orders.filter(({ uid }) => cancellations[uid]?.status !== 'cancelled'),
        refetchInterval: ({ state }: Query<OpenOrder[], Error>) =>
          isAwaitingOpenOrder(awaited, { owner, scope }, state.data)
            ? AWAITED_OPEN_ORDER_REFRESH_INTERVAL_MS
            : OPEN_ORDERS_REFRESH_INTERVAL_MS,
      }
    }),
  areParamsEqual,
)

export const activityQueryAtomFamily = atomFamily(
  ({ owner, scope, tokens }: AccountQueryParams) =>
    atomWithQuery((get) => {
      const awaited = get(awaitedActivityOrderAtom)

      return {
        queryKey: [RWA_QUERY_KEY_ROOT, 'activity', getAddressKey(owner), scope],
        queryFn: () => activityProvider.getActivity({ owner, tokens, limit: ACTIVITY_LIMIT }),
        refetchInterval: ({ state }: Query<Activity[], Error>) =>
          isAwaitingActivityOrder(awaited, { owner, scope }, state.data)
            ? AWAITED_ACTIVITY_REFRESH_INTERVAL_MS
            : ACTIVITY_REFRESH_INTERVAL_MS,
      }
    }),
  areParamsEqual,
)
