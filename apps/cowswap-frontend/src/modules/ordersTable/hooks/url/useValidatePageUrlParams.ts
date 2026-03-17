import { useLayoutEffect } from 'react'

import { useLocation } from 'react-router'

import { useNavigate } from 'common/hooks/useNavigate'
import { OrderTabId } from 'common/state/routesState'

import { ORDERS_TABLE_PAGE_SIZE } from '../../state/tabs/ordersTableTabs.constants'
import { buildOrdersTableUrl } from '../../utils/url/buildOrdersTableUrl'
import { parseOrdersTableUrl } from '../../utils/url/parseOrdersTableUrl'

/*

TODO: Check on ordersTable atom mount:



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

// TODO: Move to atoms:
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
    const shouldResetTabId = currentTabId !== params.tabId

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
