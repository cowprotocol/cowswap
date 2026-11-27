import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import { MilkGlassCountdown } from 'common/pure/MilkGlassCountdown/MilkGlassCountdown.pure'

export interface AuctionCountdownProps {
  targetEpochSec: number
  durationMs: number
}

export function AuctionCountdown({ targetEpochSec, durationMs }: AuctionCountdownProps): ReactNode {
  return (
    <MilkGlassCountdown
      targetEpochSec={targetEpochSec}
      durationMs={durationMs}
      label={<Trans>Until your order enters the auction</Trans>}
    />
  )
}
