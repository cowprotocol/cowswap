import * as styledEl from './styled'

import { PROGRESS_BAR_TIMER_DURATION } from '../../hooks/useOrderProgressBarProps'

interface CircularCountdownProps {
  countdown: number
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CircularCountdown({ countdown }: CircularCountdownProps) {
  const radius = 45
  const circumference = 2 * Math.PI * radius

  return (
    <styledEl.CountdownWrapper>
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
      <styledEl.CountdownText>{countdown}</styledEl.CountdownText>
    </styledEl.CountdownWrapper>
  )
}
