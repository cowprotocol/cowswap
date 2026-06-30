import { useLayoutEffect } from 'react'

import { useLocation } from 'react-router'

import { useNavigate } from 'common/hooks/useNavigate'

import { ORDERS_TABLE_PAGE_SIZE, OrderTabId } from '../../state/tabs/ordersTableTabs.constants'
import { buildOrdersTableUrl } from '../../utils/url/buildOrdersTableUrl'
import { parseOrdersTableUrl } from '../../utils/url/parseOrdersTableUrl'

// Reset page params if they are invalid
export function useValidatePageUrlParams(
  ordersLength: number,
  currentTabId: OrderTabId,
  currentPageNumber: number,
): void {
  const location = useLocation()
  const navigate = useNavigate()

  useLayoutEffect(() => {
    const pagesCount = Math.ceil(ordersLength / ORDERS_TABLE_PAGE_SIZE)
    const params = parseOrdersTableUrl(location.search)

    const shouldResetPageNumber =
      (pagesCount > 0 && currentPageNumber > pagesCount) ||
      currentPageNumber < 1 ||
      currentPageNumber !== params.pageNumber
    // Only normalize the tab when the URL has no valid tab.
    // `currentTabId` may transiently differ from a valid `params.tabId` because of the
    // empty-tab fallback in `useCurrentTab` (e.g. a freshly placed order has not reached
    // the Signing list yet). Rewriting the URL in that case would permanently bounce the
    // user off the tab they were explicitly navigated to.
    const shouldResetTabId = !params.tabId

    if (shouldResetPageNumber || shouldResetTabId) {
      navigate(
        buildOrdersTableUrl(location, {
          pageNumber: shouldResetPageNumber ? 1 : undefined,
          tabId: shouldResetTabId ? currentTabId : undefined,
        }),
        { replace: true },
      )
    }
  }, [navigate, location, currentTabId, currentPageNumber, ordersLength])
}
