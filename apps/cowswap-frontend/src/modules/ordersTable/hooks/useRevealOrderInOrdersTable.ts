import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { OrderTabId } from 'entities/routes/routes.atom'

import { useNavigateToOrdersTableTab } from './tabs/useNavigateToOrdersTableTab'

import { resetOrdersTableFiltersAtom } from '../state/filters/ordersTableFilters.atom'
import { highlightOrderRow, HighlightOrderRowOptions } from '../utils/highlightOrderRow.utils'

export function useRevealOrderInOrdersTable(): (
  orderId: string,
  tabId: OrderTabId,
  options?: HighlightOrderRowOptions,
) => Promise<boolean> {
  const navigateToOrdersTableTab = useNavigateToOrdersTableTab()
  const resetOrdersTableFilters = useSetAtom(resetOrdersTableFiltersAtom)

  return useCallback(
    async (orderId: string, tabId: OrderTabId, options?: HighlightOrderRowOptions): Promise<boolean> => {
      if (await highlightOrderRow(orderId, options)) {
        return true
      }

      resetOrdersTableFilters()
      navigateToOrdersTableTab(tabId)
      await highlightOrderRow(orderId, options)

      return false
    },
    [navigateToOrdersTableTab, resetOrdersTableFilters],
  )
}
