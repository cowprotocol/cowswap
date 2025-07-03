import { useAtomValue } from 'jotai'

import { ordersTableStateAtom } from '../state/ordersTableStateAtom'
import { OrdersTableState } from '../types'

export function useOrdersTableState(): OrdersTableState | null {
  return useAtomValue(ordersTableStateAtom)
}
