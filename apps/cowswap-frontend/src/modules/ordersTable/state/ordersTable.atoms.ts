import { atom } from 'jotai'

import { OrdersTableState } from './ordersTable.types'

export const ordersTableStateAtom = atom<OrdersTableState | null>(null)
