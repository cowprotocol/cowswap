import { useEffect, useState } from 'react'

import { useDebounce, usePrevious } from '@cowprotocol/common-hooks'

import ms from 'ms.macro'

const DEBOUNCE_FOR_PENDING_ORDERS_MS = ms`1s`

/**
 * Invalidate cache trigger that only updates when the number of pending orders decreases
 * This useful to avoid pushing requests when orders are being created
 * */
export function usePendingOrdersCountInvalidateCacheTrigger(pendingOrdersCount = 0): number {
  const previousPendingOrdersCount = usePrevious(pendingOrdersCount)

  const [triggerValue, setTriggerValue] = useState(0)

  useEffect(() => {
    if (pendingOrdersCount !== undefined && previousPendingOrdersCount !== undefined) {
      if (pendingOrdersCount < previousPendingOrdersCount) {
        setTriggerValue((prev) => prev + 1)
      }
    }
  }, [pendingOrdersCount, previousPendingOrdersCount])

  return useDebounce(triggerValue, DEBOUNCE_FOR_PENDING_ORDERS_MS)
}
