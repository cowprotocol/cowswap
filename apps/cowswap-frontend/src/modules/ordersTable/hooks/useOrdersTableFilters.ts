import { useAtomValue } from 'jotai'

import { ordersTableFiltersAtom } from '../state/ordersTable.atoms'
import { OrdersTableFilters } from '../state/ordersTable.types'

export function useOrdersTableFilters(): OrdersTableFilters {
  return useAtomValue(ordersTableFiltersAtom)
}
