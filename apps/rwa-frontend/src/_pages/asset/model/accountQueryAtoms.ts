import { areAddressesEqual, getAddressKey } from '@cowprotocol/cow-sdk'

import { atomFamily } from 'jotai-family'
import { atomWithQuery } from 'jotai-tanstack-query'

import { activityProvider } from '../api/activity'
import { getOpenOrders } from '../api/openOrders'

import type { RwaAsset } from '@/entities/asset'

import { RWA_QUERY_KEY_ROOT } from '@/shared/api'

export interface AccountAssetParams {
  owner: string
  asset: RwaAsset
}

const OPEN_ORDERS_REFRESH_INTERVAL_MS = 15_000
const ACTIVITY_REFRESH_INTERVAL_MS = 60_000
const ACTIVITY_LIMIT = 50

function areParamsEqual(a: AccountAssetParams, b: AccountAssetParams): boolean {
  return areAddressesEqual(a.owner, b.owner) && a.asset.ticker === b.asset.ticker
}

export const openOrdersQueryAtomFamily = atomFamily(
  ({ owner, asset }: AccountAssetParams) =>
    atomWithQuery(() => ({
      queryKey: [RWA_QUERY_KEY_ROOT, 'open-orders', getAddressKey(owner), asset.ticker],
      queryFn: () => getOpenOrders({ owner, tokens: asset.tokens }),
      refetchInterval: OPEN_ORDERS_REFRESH_INTERVAL_MS,
    })),
  areParamsEqual,
)

export const activityQueryAtomFamily = atomFamily(
  ({ owner, asset }: AccountAssetParams) =>
    atomWithQuery(() => ({
      queryKey: [RWA_QUERY_KEY_ROOT, 'activity', getAddressKey(owner), asset.ticker],
      queryFn: () => activityProvider.getActivity({ owner, tokens: asset.tokens, limit: ACTIVITY_LIMIT }),
      refetchInterval: ACTIVITY_REFRESH_INTERVAL_MS,
    })),
  areParamsEqual,
)
