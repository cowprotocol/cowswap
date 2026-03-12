import { useAtomValue } from 'jotai'

import { ordersTableStateAtom } from '../state/ordersTable.atoms'
import { OrdersTableState } from '../state/ordersTable.types'

// TODO: Remove hook
export function useOrdersTableState(): OrdersTableState | null {
  return useAtomValue(ordersTableStateAtom)
}
