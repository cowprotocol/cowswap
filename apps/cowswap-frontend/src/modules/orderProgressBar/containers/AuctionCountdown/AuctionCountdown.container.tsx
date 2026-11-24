import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { canonicalBatchIntervalSecondsAtom } from 'modules/trade'

import { AuctionCountdown as AuctionCountdownPure } from '../../pure/steps/AuctionCountdown.pure'

export interface AuctionCountdownContainerProps {
  targetEpochSec: number
  onRemainingChange?: (remainingSec: number) => void
  fallback?: ReactNode
}

export function AuctionCountdown({
  targetEpochSec,
  onRemainingChange,
  fallback = null,
}: AuctionCountdownContainerProps): ReactNode {
  const intervalSeconds = useAtomValue(canonicalBatchIntervalSecondsAtom)

  if (intervalSeconds === undefined) {
    return fallback
  }

  return (
    <AuctionCountdownPure
      targetEpochSec={targetEpochSec}
      durationMs={intervalSeconds * 1000}
      onRemainingChange={onRemainingChange}
    />
  )
}
