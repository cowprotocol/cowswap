import { createContext } from 'react'

import type { TableState, TableStateSetters } from 'explorer/components/OrdersTableWidget/useTable'

interface TwapPaginationContextValue extends TableStateSetters {
  data: readonly unknown[] | undefined
  isLoading: boolean
  tableState: TableState
}

export const TwapPaginationContext = createContext({} as TwapPaginationContextValue)
