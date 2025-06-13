import { useLayoutEffect } from 'react'

import { useLocation } from 'react-router'

import { useNavigate } from 'common/hooks/useNavigate'

import { ORDERS_TABLE_PAGE_SIZE } from '../../../const/tabs'
import { buildOrdersTableUrl } from '../../../utils/buildOrdersTableUrl'
import { parseOrdersTableUrl } from '../../../utils/parseOrdersTableUrl'

// Reset page params if they are invalid
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useValidatePageUrlParams(ordersLength: number, currentTabId: string, currentPageNumber: number) {
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
