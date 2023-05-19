import { useMemo } from 'react'
import useRecentActivity, { TransactionAndOrder } from 'legacy/hooks/useRecentActivity'
import { CONFIRMED_STATES, PENDING_STATES } from 'legacy/state/orders/actions'
import { OrderClass } from '@cowprotocol/cow-sdk'

const isPending = (data: TransactionAndOrder) => PENDING_STATES.includes(data.status)

const isConfirmed = (data: TransactionAndOrder) => CONFIRMED_STATES.includes(data.status)

export function useCategorizeRecentActivity() {
  // Returns all RECENT (last day) transaction and orders in 2 arrays: pending and confirmed
  const allRecentActivity = useRecentActivity()

  const [pendingActivity, confirmedActivity] = useMemo(
    () =>
      // Separate the array into 2: transitory (pending) and final (confirmed) states
      allRecentActivity.reduce<[string[], string[]]>(
        (acc, activity) => {
          // Not order transactions (wrap, approve, etc.) doesn't have class property
          if (!activity.class || activity.class !== OrderClass.LIMIT) {
            if (isPending(activity)) {
              acc[0].push(activity.id)
            } else if (isConfirmed(activity)) {
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
