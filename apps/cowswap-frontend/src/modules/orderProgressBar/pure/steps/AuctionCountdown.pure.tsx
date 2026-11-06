import { ReactNode, useRef } from 'react'

import { useCountdown } from '@cowprotocol/common-hooks'
import { formatAuctionCountdown } from '@cowprotocol/common-utils'

import { Trans } from '@lingui/react/macro'

import * as styledEl from './AuctionCountdown.styled'

export interface AuctionCountdownProps {
  targetEpochSec: number
  onRemainingChange?: (remainingSec: number) => void
}

export function AuctionCountdown({ targetEpochSec, onRemainingChange }: AuctionCountdownProps): ReactNode {
  const timerRef = useRef<HTMLDivElement>(null)

  useCountdown({
    targetRef: timerRef,
    targetEpochSec,
    format: formatAuctionCountdown,
    onRemainingChange,
  })

  return (
    <styledEl.Wrapper>
      <styledEl.Timer ref={timerRef} />
      <styledEl.Caption>
        <Trans>Until your order enters the auction</Trans>
      </styledEl.Caption>
    </styledEl.Wrapper>
  )
}
