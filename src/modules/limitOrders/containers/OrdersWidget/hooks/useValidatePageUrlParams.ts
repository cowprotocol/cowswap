import { useLayoutEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Order } from 'legacy/state/orders/actions'
import { LIMIT_ORDERS_PAGE_SIZE } from '../../../const/limitOrdersTabs'
import { buildLimitOrdersUrl, parseLimitOrdersPageParams } from '../../../utils/buildLimitOrdersUrl'

// Reset page params if they are invalid
export function useValidatePageUrlParams(orders: Order[], currentTabId: string, currentPageNumber: number) {
  const location = useLocation()
  const navigate = useNavigate()

  useLayoutEffect(() => {
    const pagesCount = Math.ceil(orders.length / LIMIT_ORDERS_PAGE_SIZE)
    const params = parseLimitOrdersPageParams(location.search)

    const shouldResetPageNumber =
      (pagesCount > 0 && currentPageNumber > pagesCount) ||
      currentPageNumber < 1 ||
      currentPageNumber !== params.pageNumber
    const shouldResetTabId = currentTabId !== params.tabId

    if (shouldResetPageNumber || shouldResetTabId) {
      navigate(
        buildLimitOrdersUrl(location, {
          pageNumber: shouldResetPageNumber ? 1 : undefined,
          tabId: shouldResetTabId ? currentTabId : undefined,
        }),
        { replace: true }
      )
    }
  }, [navigate, location, currentTabId, currentPageNumber, orders.length])
}
