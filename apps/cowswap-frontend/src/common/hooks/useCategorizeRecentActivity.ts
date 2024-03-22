import { useMemo } from 'react'

import { UiOrderType } from '@cowprotocol/types'

import { useRecentActivity } from 'legacy/hooks/useRecentActivity'
import { CREATING_STATES, Order, OrderStatus, PENDING_STATES } from 'legacy/state/orders/actions'

import { getIsFinalizedOrder } from 'utils/orderUtils/getIsFinalizedOrder'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

export const isPending = ({ status }: { status: OrderStatus }) => PENDING_STATES.includes(status)

export const isCreating = ({ status }: { status: OrderStatus }) => CREATING_STATES.includes(status)

export function useCategorizeRecentActivity() {
  // Returns all RECENT (last day) transaction and orders in 2 arrays: pending and confirmed
  const allRecentActivity = useRecentActivity()

  const [pendingActivity, confirmedActivity] = useMemo(
    () =>
      // Separate the array into 2: transitory (pending) and final (confirmed) states
      allRecentActivity.reduce<[string[], string[]]>(
        (acc, activity) => {
          // Only display regular on-chain transactions (wrap, approval, etc) OR MARKET orders
          if (!activity.class || getUiOrderType(activity as Order) === UiOrderType.SWAP) {
            if (isPending(activity)) {
              acc[0].push(activity.id)
            } else if (getIsFinalizedOrder(activity)) {
              acc[1].push(activity.id)
            }
          }
          return acc
        },
        [[], []]
      ),

    // Reducing unnecessary re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(allRecentActivity)]
  )
  return { pendingActivity, confirmedActivity }
}
