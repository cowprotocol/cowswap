import { ReactElement } from 'react'

import * as styledEl from './styled'

import { PROGRESS_BAR_TIMER_DURATION } from '../../hooks/useOrderProgressBarProps'

interface CircularCountdownProps {
  countdown: number
  isDelayed?: boolean
  bgColor?: string
}

export function CircularCountdown({ countdown, isDelayed, bgColor }: CircularCountdownProps): ReactElement {
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
          end={PROGRESS_BAR_TIMER_DURATION}
        />
      </styledEl.CircularProgress>
      <styledEl.CountdownText $shouldPulse={shouldPulse}>{displayValue}</styledEl.CountdownText>
    </styledEl.CountdownWrapper>
  )
}
