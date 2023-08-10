import { useMemo } from 'react'

import { OrderClass } from '@cowprotocol/cow-sdk'

import { useRecentActivity, TransactionAndOrder } from 'legacy/hooks/useRecentActivity'
import { PENDING_STATES } from 'legacy/state/orders/actions'

import { getIsFinalizedOrder } from 'utils/orderUtils/getIsFinalizedOrder'

const isPending = (data: TransactionAndOrder) => PENDING_STATES.includes(data.status)

export function useCategorizeRecentActivity() {
  // Returns all RECENT (last day) transaction and orders in 2 arrays: pending and confirmed
  const allRecentActivity = useRecentActivity()

  const [pendingActivity, confirmedActivity] = useMemo(
    () =>
      // Separate the array into 2: transitory (pending) and final (confirmed) states
      allRecentActivity.reduce<[string[], string[]]>(
        (acc, activity) => {
          // Only display regular on-chain transactions (wrap, approval, etc) OR MARKET orders
          if (!activity.class || activity.class === OrderClass.MARKET) {
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
