import { areAddressesEqual, getAddressKey } from '@cowprotocol/cow-sdk'

import { atomFamily } from 'jotai-family'
import { atomWithQuery } from 'jotai-tanstack-query'

import { activityProvider } from '../api/activity'
import { getOpenOrders } from '../api/openOrders'

import type { RwaToken } from '@/entities/asset'

import { RWA_QUERY_KEY_ROOT } from '@/shared/api'

export interface AccountQueryParams {
  owner: string
  /** Identifies `tokens` in the query key, e.g. an asset ticker */
  scope: string
  tokens: RwaToken[]
}

const OPEN_ORDERS_REFRESH_INTERVAL_MS = 15_000
const ACTIVITY_REFRESH_INTERVAL_MS = 60_000
const ACTIVITY_LIMIT = 50

function areParamsEqual(a: AccountQueryParams, b: AccountQueryParams): boolean {
  return areAddressesEqual(a.owner, b.owner) && a.scope === b.scope
}

export const openOrdersQueryAtomFamily = atomFamily(
  ({ owner, scope, tokens }: AccountQueryParams) =>
    atomWithQuery(() => ({
      queryKey: [RWA_QUERY_KEY_ROOT, 'open-orders', getAddressKey(owner), scope],
      queryFn: () => getOpenOrders({ owner, tokens }),
      refetchInterval: OPEN_ORDERS_REFRESH_INTERVAL_MS,
    })),
  areParamsEqual,
)

export const activityQueryAtomFamily = atomFamily(
  ({ owner, scope, tokens }: AccountQueryParams) =>
    atomWithQuery(() => ({
      queryKey: [RWA_QUERY_KEY_ROOT, 'activity', getAddressKey(owner), scope],
      queryFn: () => activityProvider.getActivity({ owner, tokens, limit: ACTIVITY_LIMIT }),
      refetchInterval: ACTIVITY_REFRESH_INTERVAL_MS,
    })),
  areParamsEqual,
)
