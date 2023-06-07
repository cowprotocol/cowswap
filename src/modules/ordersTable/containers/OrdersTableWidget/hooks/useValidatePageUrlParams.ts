import { useLayoutEffect } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'

import { Order } from 'legacy/state/orders/actions'

import { ORDERS_TABLE_PAGE_SIZE } from '../../../const/tabs'
import { buildOrdersTableUrl, parseOrdersTableUrl } from '../../../utils/buildOrdersTableUrl'

// Reset page params if they are invalid
export function useValidatePageUrlParams(orders: Order[], currentTabId: string, currentPageNumber: number) {
  const location = useLocation()
  const navigate = useNavigate()

  useLayoutEffect(() => {
    const pagesCount = Math.ceil(orders.length / ORDERS_TABLE_PAGE_SIZE)
    const params = parseOrdersTableUrl(location.search)

    const shouldResetPageNumber =
      (pagesCount > 0 && currentPageNumber > pagesCount) ||
      currentPageNumber < 1 ||
      currentPageNumber !== params.pageNumber
    const shouldResetTabId = currentTabId !== params.tabId

    if (shouldResetPageNumber || shouldResetTabId) {
      navigate(
        buildOrdersTableUrl(location, {
          pageNumber: shouldResetPageNumber ? 1 : undefined,
          tabId: shouldResetTabId ? currentTabId : undefined,
        }),
        { replace: true }
      )
    }
  }, [navigate, location, currentTabId, currentPageNumber, orders.length])
}
