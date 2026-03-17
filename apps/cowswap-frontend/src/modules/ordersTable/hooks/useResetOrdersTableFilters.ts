import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { ordersTableFiltersAtom, DEFAULT_ORDERS_TABLE_FILTERS } from '../state/ordersTable.atoms'
import { OrdersTableFilters } from '../state/ordersTable.types'

export interface UseResetOrdersTableFiltersProps extends Partial<OrdersTableFilters> {
  syncWithUrl?: boolean
}

// TODO: Move to atoms observing the URL?
export function useResetOrdersTableFilters({
  // TODO: Not implemented:
  // syncWithUrl = true,
  ...ordersTableFilters
}: UseResetOrdersTableFiltersProps): void {
  console.trace('useResetOrdersTableFilters')

  const setOrdersTableFilters = useSetAtom(ordersTableFiltersAtom)

  useEffect(() => {
    setOrdersTableFilters({ ...DEFAULT_ORDERS_TABLE_FILTERS, ...ordersTableFilters })

    // TODO: Reset on unmount... Unnecessary re-render or better for performance?

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /*
  // TODO: Only possible after orders load...

  const navigate = useNavigate()
  const location = useLocation()

  // Set page params initially once
  useEffect(() => {
    // todo - need to divide this logic from updater
    syncWithUrl &&
      navigate(
        buildOrdersTableUrl(location, {
          pageNumber: currentPageNumber,
          tabId: currentTabId,
        }),
        { replace: true },
      )
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // TODO: Same, maybe can be combined?
  useValidatePageUrlParams(orders.length, currentTabId, currentPageNumber)
  */
}
