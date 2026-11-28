import { useEffect, useLayoutEffect, useState } from 'react'

import { useLocalTimeOffset } from '@cowprotocol/common-hooks'
import { getServerNowSec } from '@cowprotocol/common-utils'

import type { Order } from 'legacy/state/orders/actions'

import { useOrderValidFrom } from './useOrderValidFrom'

export interface AuctionWaitState {
  auctionValidFrom: number | undefined
  isAuctionWaiting: boolean
}

/**
 * Tracks whether a Wait for CoWs order is still waiting for `validFrom`.
 * Expiry is timed here: the milk glass does not mount when the batch interval is missing.
 */
export function useAuctionWaitState(order: Order | undefined): AuctionWaitState {
  const validFrom = useOrderValidFrom(order)
  const timeOffsetSec = useLocalTimeOffset() ?? 0
  const [isWaiting, setIsWaiting] = useState(() => computeIsWaiting(validFrom, timeOffsetSec))

  useLayoutEffect(() => {
    setIsWaiting(computeIsWaiting(validFrom, timeOffsetSec))
  }, [validFrom, timeOffsetSec])

  useEffect(() => {
    if (validFrom == null) {
      return
    }

    const delayMs = (validFrom - getServerNowSec(timeOffsetSec)) * 1000

    if (delayMs <= 0) {
      return
    }

    const timeoutId = window.setTimeout(() => setIsWaiting(false), delayMs)

    return () => window.clearTimeout(timeoutId)
  }, [validFrom, timeOffsetSec])

  return {
    auctionValidFrom: isWaiting && validFrom != null ? validFrom : undefined,
    isAuctionWaiting: isWaiting,
  }
}

function computeIsWaiting(validFrom: number | undefined, timeOffsetSec: number): boolean {
  return validFrom != null && validFrom > getServerNowSec(timeOffsetSec)
}
