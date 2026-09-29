import { atom } from 'jotai'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

export interface OrdersTableDrawerState {
  isOpen: boolean
}

export const { atom: ordersTableDrawerAtom, updateAtom: updateOrdersTableDrawerAtom } = atomWithPartialUpdate(
  atom<OrdersTableDrawerState>({ isOpen: false }),
)
