import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media } from '@cowprotocol/ui'

import { OrderTabId } from 'entities/routes/routes.atom'

import { useNavigateToOrdersTableTab } from './tabs/useNavigateToOrdersTableTab'

import { resetOrdersTableFiltersAtom } from '../state/filters/ordersTableFilters.atom'
import { highlightOrderRow, HighlightOrderRowOptions } from '../utils/highlightOrderRow.utils'

export interface RevealOrderInOrdersTableOptions extends HighlightOrderRowOptions {
  /** Highlight even while the orders table is hidden in the small-screen drawer. */
  revealWhenInDrawer?: boolean
}

export function useRevealOrderInOrdersTable(): (
  orderId: string,
  tabId: OrderTabId,
  options?: RevealOrderInOrdersTableOptions,
) => Promise<boolean> {
  const navigateToOrdersTableTab = useNavigateToOrdersTableTab()
  const resetOrdersTableFilters = useSetAtom(resetOrdersTableFiltersAtom)
  const isOrdersTableInDrawer = useMediaQuery(Media.upToLarge(false))

  return useCallback(
    async (orderId: string, tabId: OrderTabId, options?: RevealOrderInOrdersTableOptions): Promise<boolean> => {
      // The row is unmounted while the small-screen drawer is closed, so an automatic reveal cannot blink it.
      if (isOrdersTableInDrawer && !options?.revealWhenInDrawer) {
        return false
      }

      const highlightOptions: HighlightOrderRowOptions = {
        timeout: options?.timeout,
        polling: options?.polling,
      }

      if (await highlightOrderRow(orderId, highlightOptions)) {
        return true
      }

      resetOrdersTableFilters()
      navigateToOrdersTableTab(tabId)
      await highlightOrderRow(orderId, highlightOptions)

      return false
    },
    [isOrdersTableInDrawer, navigateToOrdersTableTab, resetOrdersTableFilters],
  )
}
