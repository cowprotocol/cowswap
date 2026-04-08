import { useEffect, useRef } from 'react'

import { useNavigate } from 'common/hooks/useNavigate'

import { OrdersTableList } from '../../state/ordersTable.types'
import { OrderTabId } from '../../state/tabs/ordersTableTabs.constants'
import { useGetBuildOrdersTableUrl } from '../url/useGetBuildOrdersTableUrl'

/**
 * Grace period (ms) after the current tab changes before redirect logic activates.
 *
 * After placing a TWAP order the URL is set to ?tab=signing immediately, but the
 * order list atom propagates asynchronously through several derived atoms and an
 * async token-fetch step.  Without a grace period the hook would see signing
 * count === 0 and redirect to Open before the order has a chance to appear.
 */
const TAB_CHANGE_GRACE_MS = 2000

/**
 * Redirects to the Open tab when the Signing or Unfillable tab becomes empty,
 * provided the user is currently on that tab.
 *
 * Two safeguards prevent false-positive redirects after order placement:
 *
 * 1. **Transition check** - A redirect only fires when the count moves from
 *    >0 to 0, not when the tab starts at 0 (e.g. navigating to signing before
 *    the atom has propagated).
 *
 * 2. **Grace period** - Every time `currentTabId` changes a grace timer starts.
 *    Redirects are suppressed until the timer expires, giving async state enough
 *    time to propagate the newly placed order into the orders list.
 */
export function useRedirectWhenTabBecomesEmpty(
  ordersList: OrdersTableList,
  currentTabId: OrderTabId,
): void {
  const navigate = useNavigate()
  const buildOrdersTableUrl = useGetBuildOrdersTableUrl()

  const prevSigningCount = useRef(ordersList.signing.length)
  const prevUnfillableCount = useRef(ordersList.unfillable.length)
  const tabChangeTime = useRef(Date.now())

  // Track when the active tab changes so we can apply a grace period
  useEffect(() => {
    tabChangeTime.current = Date.now()
  }, [currentTabId])

  useEffect(() => {
    const signingCount = ordersList.signing.length
    const unfillableCount = ordersList.unfillable.length

    const signingBecameEmpty = prevSigningCount.current > 0 && signingCount === 0
    const unfillableBecameEmpty = prevUnfillableCount.current > 0 && unfillableCount === 0

    prevSigningCount.current = signingCount
    prevUnfillableCount.current = unfillableCount

    // Inside the grace period after a tab change: skip redirect.
    // This prevents racing with async atom propagation after order placement.
    if (Date.now() - tabChangeTime.current < TAB_CHANGE_GRACE_MS) {
      return
    }

    const shouldRedirect =
      (currentTabId === OrderTabId.signing && signingBecameEmpty) ||
      (currentTabId === OrderTabId.unfillable && unfillableBecameEmpty)

    if (shouldRedirect) {
      navigate(buildOrdersTableUrl({ tabId: OrderTabId.open, pageNumber: 1 }))
    }
  }, [ordersList.signing.length, ordersList.unfillable.length, currentTabId, navigate, buildOrdersTableUrl])
}
