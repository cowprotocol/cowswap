import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'

import { HistoryStatusFilter } from 'modules/ordersTable/hooks/useFilteredOrders'
import { OrderTabId } from 'modules/ordersTable/state/tabs/ordersTableTabs.constants'

import {
  ordersTableFiltersAtom,
  ordersTableTabsAtom,
  partiallyUpdateOrdersTableFiltersAtom,
} from '../state/ordersTable.atoms'
import { DEFAULT_ORDERS_TABLE_FILTERS } from '../state/ordersTable.atoms'
import { OrdersTableFilters, TabParams } from '../state/ordersTable.types'
import { TabOrderTypes } from '../state/ordersTable.types'

export function useOrdersTableFilters(): OrdersTableFilters {
  return useAtomValue(ordersTableFiltersAtom)
}

export function useOrdersTableTabs(): TabParams[] {
  return useAtomValue(ordersTableTabsAtom)
}

export function usePartiallyUpdateOrdersTableFiltersAtom(): (filters: Partial<OrdersTableFilters>) => void {
  const partiallyUpdateOrdersTableFilters = useSetAtom(partiallyUpdateOrdersTableFiltersAtom)

  /*
  const resetPagination = (): void => {
    if (!currentPageNumber || currentPageNumber === 1 || !filteredOrders) return

    const url = buildOrdersTableUrl({ pageNumber: 1 })

    navigate(url, { replace: true })
  }
  */

  return useCallback(
    (filters: Partial<OrdersTableFilters>) => {
      const resetPagination = filters.hasOwnProperty('searchTerm') || filters.hasOwnProperty('historyStatusFilter')
      const resetQueryParams = filters.hasOwnProperty('currentTabId') && filters.currentTabId !== OrderTabId.history

      const completeUpdate = { ...filters }

      if (resetPagination) {
        completeUpdate.currentPageNumber = 1
      }

      if (resetQueryParams) {
        completeUpdate.searchTerm = ''
        completeUpdate.historyStatusFilter = HistoryStatusFilter.FILLED
      }

      // TODO: There should be no need to call resetPagination to call navigate. Just changing the currentPageNumber
      // value should be enough. useValidatePageUrlParams or something else should take care of syncing the URL.

      partiallyUpdateOrdersTableFilters(completeUpdate)
    },
    [partiallyUpdateOrdersTableFilters],
  )
}

export interface UseResetOrdersTableFiltersProps extends Partial<OrdersTableFilters> {
  orderType: TabOrderTypes
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
