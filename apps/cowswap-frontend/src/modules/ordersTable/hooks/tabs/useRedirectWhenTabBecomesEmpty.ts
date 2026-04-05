import { useEffect, useRef } from 'react'

import { useNavigate } from 'common/hooks/useNavigate'

import { OrdersTableList } from '../../state/ordersTable.types'
import { OrderTabId } from '../../state/tabs/ordersTableTabs.constants'
import { useGetBuildOrdersTableUrl } from '../url/useGetBuildOrdersTableUrl'

/**
 * Redirects to the Open tab when the Signing or Unfillable tab transitions
 * from having orders to being empty, and the user is currently on that tab.
 *
 * This replaces the previous synchronous check in useCurrentTab that caused
 * a race condition: after placing a TWAP order, the URL was set to ?tab=signing
 * but the order list hadn't yet propagated, so useCurrentTab saw signing.length === 0
 * and immediately redirected to the Open tab.
 *
 * By using a ref to track the previous count, this hook only fires when the count
 * actually transitions from >0 to 0, not when it starts at 0.
 */
export function useRedirectWhenTabBecomesEmpty(
  ordersList: OrdersTableList,
  currentTabId: OrderTabId,
): void {
  const navigate = useNavigate()
  const buildOrdersTableUrl = useGetBuildOrdersTableUrl()

  const prevSigningCount = useRef(ordersList.signing.length)
  const prevUnfillableCount = useRef(ordersList.unfillable.length)

  useEffect(() => {
    const signingCount = ordersList.signing.length
    const unfillableCount = ordersList.unfillable.length

    const signingBecameEmpty = prevSigningCount.current > 0 && signingCount === 0
    const unfillableBecameEmpty = prevUnfillableCount.current > 0 && unfillableCount === 0

    prevSigningCount.current = signingCount
    prevUnfillableCount.current = unfillableCount

    const shouldRedirect =
      (currentTabId === OrderTabId.signing && signingBecameEmpty) ||
      (currentTabId === OrderTabId.unfillable && unfillableBecameEmpty)

    if (shouldRedirect) {
      navigate(buildOrdersTableUrl({ tabId: OrderTabId.open, pageNumber: 1 }))
    }
  }, [ordersList.signing.length, ordersList.unfillable.length, currentTabId, navigate, buildOrdersTableUrl])
}
