import { useAtomValue } from 'jotai'

import { ordersTableStateAtom } from '../state/ordersTable.atoms'
import { OrdersTableState } from '../state/ordersTable.types'

export function useOrdersTableState(): OrdersTableState | null {
  return useAtomValue(ordersTableStateAtom)
}
