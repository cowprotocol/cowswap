import { atom } from 'jotai'

import { OrdersTableState } from '../types'

export const ordersTableStateAtom = atom<OrdersTableState | null>(null)
