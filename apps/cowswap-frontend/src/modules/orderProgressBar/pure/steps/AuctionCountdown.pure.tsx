import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import { MilkGlassCountdown } from 'common/pure/MilkGlassCountdown/MilkGlassCountdown.pure'

export interface AuctionCountdownProps {
  targetEpochSec: number
  durationMs: number
  onRemainingChange?: (remainingSec: number) => void
}

export function AuctionCountdown({ targetEpochSec, durationMs, onRemainingChange }: AuctionCountdownProps): ReactNode {
  return (
    <MilkGlassCountdown
      targetEpochSec={targetEpochSec}
      durationMs={durationMs}
      onRemainingChange={onRemainingChange}
      label={<Trans>Until your order enters the auction</Trans>}
    />
  )
}
