import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { SetStateAction } from 'react'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { isEoaTwapOrderItem } from '../utils/isEoaTwapOrderItem'

import type { TwapOrdersList } from './twapOrdersAtom'

const MAX_PERSISTED_ORDERS = 1000
type PersistedEoaTwapOrders = Record<string, TwapOrdersList>

const persistedEoaTwapOrdersAtom = atomWithStorage<PersistedEoaTwapOrders>(
  'eoa-twap-orders:v2',
  {},
  getJotaiIsolatedStorage<PersistedEoaTwapOrders>(),
  { getOnInit: true },
)

export const eoaTwapOrdersAtom = atom(
  (get): TwapOrdersList => {
    const { account, chainId } = get(walletInfoAtom)
    if (!account || !chainId) return {}

    const orders = get(persistedEoaTwapOrdersAtom)[getStorageKey(chainId, account)] ?? {}

    const eoaOrders: TwapOrdersList = {}
    for (const [id, order] of Object.entries(orders)) {
      if (isEoaTwapOrderItem(order)) {
        eoaOrders[id] = order
      }
    }

    return eoaOrders
  },
  (get, set, update: SetStateAction<TwapOrdersList>): void => {
    const { account, chainId } = get(walletInfoAtom)
    if (!account || !chainId) return

    const storageKey = getStorageKey(chainId, account)
    const persistedOrders = get(persistedEoaTwapOrdersAtom)
    const currentOrders = persistedOrders[storageKey] ?? {}
    const updatedOrders = typeof update === 'function' ? update(currentOrders) : update
    const latestOrders: TwapOrdersList = Object.fromEntries(
      Object.values(updatedOrders)
        .filter(isEoaTwapOrderItem)
        .sort((a, b) => Date.parse(b.submissionDate) - Date.parse(a.submissionDate))
        .slice(0, MAX_PERSISTED_ORDERS)
        .map((order) => [order.id, order]),
    )

    set(persistedEoaTwapOrdersAtom, {
      ...persistedOrders,
      [storageKey]: latestOrders,
    })
  },
)

function getStorageKey(chainId: number, owner: string): string {
  return `${chainId}:${getAddressKey(owner)}`
}
