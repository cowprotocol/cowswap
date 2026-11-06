import { useCallback, useLayoutEffect, useState } from 'react'

import { useLocalTimeOffset } from '@cowprotocol/common-hooks'
import { getServerNowSec } from '@cowprotocol/common-utils'

import type { Order } from 'legacy/state/orders/actions'

import { useOrderValidFrom } from './useOrderValidFrom'

export interface AuctionWaitState {
  auctionValidFrom: number | undefined
  isAuctionWaiting: boolean
  onAuctionRemainingChange: (remainingSec: number) => void
}

/**
 * Tracks whether a Wait for CoWs order is still waiting for `validFrom`.
 * Display ticking is owned by `useCountdown` in `AuctionCountdown`; this only gates UI.
 */
export function useAuctionWaitState(order: Order | undefined): AuctionWaitState {
  const validFrom = useOrderValidFrom(order)
  const timeOffsetSec = useLocalTimeOffset() ?? 0
  const [isWaiting, setIsWaiting] = useState(() => computeIsWaiting(validFrom, timeOffsetSec))

  useLayoutEffect(() => {
    setIsWaiting(computeIsWaiting(validFrom, timeOffsetSec))
  }, [validFrom, timeOffsetSec])

  const onAuctionRemainingChange = useCallback((remainingSec: number) => {
    setIsWaiting(remainingSec > 0)
  }, [])

  return {
    auctionValidFrom: isWaiting && validFrom != null ? validFrom : undefined,
    isAuctionWaiting: isWaiting,
    onAuctionRemainingChange,
  }
}

function computeIsWaiting(validFrom: number | undefined, timeOffsetSec: number): boolean {
  return validFrom != null && validFrom > getServerNowSec(timeOffsetSec)
}
