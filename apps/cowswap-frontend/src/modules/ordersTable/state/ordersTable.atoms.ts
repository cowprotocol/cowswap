import { atom } from 'jotai'

import { OrdersTableHistoryStatusFilterOverride, OrdersTableState } from './ordersTable.types'

export const ordersTableStateAtom = atom<OrdersTableState | null>(null)

export const ordersTableHistoryStatusFilterOverrideAtom = atom<OrdersTableHistoryStatusFilterOverride | null>(null)
