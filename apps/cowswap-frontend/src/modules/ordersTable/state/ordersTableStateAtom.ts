import { atom } from 'jotai'

import { jotaiStore } from '@cowprotocol/core'

import { cowSwapStore } from 'legacy/state'
import type { AppState } from 'legacy/state'

import { OrdersTableState } from '../types'

import type { Store } from 'redux'

function subscribeWithSelector<S, T>(
  store: Store<S>,
  selector: (state: S) => T,
  onChange: (value: T) => void,
): () => void {
  let prev = selector(store.getState())

  return store.subscribe(() => {
    const next = selector(store.getState())

    if (next === prev) return

    prev = next
    onChange(next)
  })
}

export const ordersTableStateAtom = atom<OrdersTableState | null>(null)

ordersTableStateAtom.onMount = () => {
  return subscribeWithSelector(
    cowSwapStore,
    (state: AppState) => state.orders,
    () => {
      jotaiStore.set(ordersTableStateAtom, (prev) => (prev ? { ...prev, filteredOrders: prev.orders } : null))
    },
  )
}
