import { useLayoutEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Order } from 'state/orders/actions'
import { LIMIT_ORDERS_PAGE_SIZE } from '../../../const/limitOrdersTabs'
import { buildLimitOrdersUrl, parseLimitOrdersPageParams } from '../../../utils/buildLimitOrdersUrl'

// Reset page params if they are invalid
export function useValidatePageUrlParams(orders: Order[], currentTabId: string, currentPageNumber: number) {
  const location = useLocation()
  const history = useHistory()

  useLayoutEffect(() => {
    const pagesCount = Math.ceil(orders.length / LIMIT_ORDERS_PAGE_SIZE)
    const params = parseLimitOrdersPageParams(location.search)

    const shouldResetPageNumber =
      currentPageNumber > pagesCount || currentPageNumber < 1 || currentPageNumber !== params.pageNumber
    const shouldResetTabId = currentTabId !== params.tabId

    if (shouldResetPageNumber || shouldResetTabId) {
      history.push(
        buildLimitOrdersUrl(location, {
          pageNumber: shouldResetPageNumber ? 1 : undefined,
          tabId: shouldResetTabId ? currentTabId : undefined,
        })
      )
    }
  }, [history, location, currentTabId, currentPageNumber, orders.length])
}
