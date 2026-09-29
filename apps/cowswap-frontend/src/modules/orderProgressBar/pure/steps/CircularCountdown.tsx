import { ReactElement } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import * as styledEl from './styled'

import { getProgressBarTimerDuration } from '../../constants'

interface CircularCountdownProps {
  countdown: number
  chainId: SupportedChainId
  isDelayed?: boolean
  bgColor?: string
}

export function CircularCountdown({ countdown, chainId, isDelayed, bgColor }: CircularCountdownProps): ReactElement {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const displayValue = Math.max(countdown, 1)
  const shouldPulse = countdown <= 0 || !!isDelayed

  return (
    <styledEl.CountdownWrapper bgColor={bgColor}>
      <styledEl.CircularProgress viewBox="0 0 100 100">
        <styledEl.CircleProgress
          cx="50"
          cy="50"
          r={radius}
          strokeDasharray={circumference}
          startAt={countdown}
          end={getProgressBarTimerDuration(chainId)}
        />
      </styledEl.CircularProgress>
      <styledEl.CountdownText $shouldPulse={shouldPulse}>{displayValue}</styledEl.CountdownText>
    </styledEl.CountdownWrapper>
  )
}
