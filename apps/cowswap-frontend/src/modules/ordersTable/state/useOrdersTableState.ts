import { useAtomValue } from 'jotai'

import { ordersTableStateAtom } from './ordersTable.atoms'
import { OrdersTableState } from './ordersTable.types'

export function useOrdersTableState(): OrdersTableState | null {
  return useAtomValue(ordersTableStateAtom)
}
