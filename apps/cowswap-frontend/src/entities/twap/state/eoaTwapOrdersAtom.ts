import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { SetStateAction } from 'react'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import type { TwapOrdersList } from './twapOrdersAtom'

const MAX_CACHED_EOA_TWAP_ORDERS = 1000
type EoaTwapOrdersCache = Record<string, TwapOrdersList>

export const eoaTwapOrdersCacheAtom = atomWithStorage<EoaTwapOrdersCache>(
  'eoa-twap-orders:v1',
  {},
  getJotaiIsolatedStorage<EoaTwapOrdersCache>(),
  { getOnInit: true },
)

export const eoaTwapOrdersAtom = atom(
  (get): TwapOrdersList => {
    const key = getCurrentBucketKey(get(walletInfoAtom))
    return key ? (get(eoaTwapOrdersCacheAtom)[key] ?? {}) : {}
  },
  (get, set, update: SetStateAction<TwapOrdersList>): void => {
    const key = getCurrentBucketKey(get(walletInfoAtom))
    if (!key) return

    const cache = get(eoaTwapOrdersCacheAtom)
    const currentOrders = cache[key] ?? {}
    const orders = typeof update === 'function' ? update(currentOrders) : update

    set(eoaTwapOrdersCacheAtom, {
      ...cache,
      [key]: capBucket(orders),
    })
  },
)

export function getEoaTwapOrdersCacheKey(chainId: number, owner: string): string {
  return `${chainId}:${getAddressKey(owner)}`
}

function capBucket(orders: TwapOrdersList): TwapOrdersList {
  return Object.values(orders)
    .sort((a, b) => Date.parse(b.submissionDate) - Date.parse(a.submissionDate))
    .slice(0, MAX_CACHED_EOA_TWAP_ORDERS)
    .reduce<TwapOrdersList>((result, order) => {
      result[order.id] = order
      return result
    }, {})
}

function getCurrentBucketKey({
  account,
  chainId,
}: {
  account?: string | null
  chainId?: number | null
}): string | null {
  return account && chainId ? getEoaTwapOrdersCacheKey(chainId, account) : null
}
