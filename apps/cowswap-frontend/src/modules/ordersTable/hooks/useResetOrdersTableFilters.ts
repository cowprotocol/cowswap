import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { ordersTableFiltersAtom } from '../state/ordersTable.atoms'
import { DEFAULT_ORDERS_TABLE_FILTERS } from '../state/ordersTable.atoms'
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
  const setOrdersTableFilters = useSetAtom(ordersTableFiltersAtom)

  useEffect(() => {
    setOrdersTableFilters({ ...DEFAULT_ORDERS_TABLE_FILTERS, ...ordersTableFilters })

    // TODO: Reset on unmount... Unnecessary re-render or better for performance?

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /*
  // TODO: This was in OrdersTableWidget.container.tsx. Make sure the logic is preserved somewhere:

  useEffect(() => {
    // When moving away from the history tab, reset the showOnlyFilled filter, as the UI for it won't be shown in other tabs:
    if (currentTabId !== OrderTabId.history) setHistoryStatusFilter(HistoryStatusFilter.FILLED)
  }, [currentTabId])
  */

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
