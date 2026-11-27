import { ReactNode } from 'react'

import { COW_BATCH_TIME_SECONDS } from '@cowprotocol/common-const'

import { Trans } from '@lingui/react/macro'

import { MilkGlassCountdown } from 'common/pure/MilkGlassCountdown/MilkGlassCountdown.pure'

export interface AuctionCountdownProps {
  targetEpochSec: number
  onRemainingChange?: (remainingSec: number) => void
}

export function AuctionCountdown({ targetEpochSec, onRemainingChange }: AuctionCountdownProps): ReactNode {
  return (
    <MilkGlassCountdown
      targetEpochSec={targetEpochSec}
      durationMs={COW_BATCH_TIME_SECONDS * 1000}
      onRemainingChange={onRemainingChange}
      label={<Trans>Until your order enters the auction</Trans>}
    />
  )
}
