import { ReactNode, useEffect, useRef } from 'react'

import { runCountdown, useLatestRef, useLocalTimeOffset } from '@cowprotocol/common-hooks'
import { getServerNowSec } from '@cowprotocol/common-utils'

import { CountdownDigits, CountdownDigitsHandle } from './CountdownDigits.pure'
import { MilkGlass, MilkGlassHandle } from './MilkGlass.pure'
import * as styledEl from './MilkGlassCountdown.styled'

export interface MilkGlassCountdownProps {
  /** Unix timestamp (seconds) when the countdown reaches zero. */
  targetEpochSec: number
  /** Full window length in ms, used for the milk fill level. */
  durationMs: number
  label: ReactNode
  /** Called when the displayed remaining second changes (including the first write). */
  onRemainingChange?: (remainingSec: number) => void
}

export function MilkGlassCountdown({
  targetEpochSec,
  durationMs,
  label,
  onRemainingChange,
}: MilkGlassCountdownProps): ReactNode {
  const digitsRef = useRef<CountdownDigitsHandle>(null)
  const milkRef = useRef<MilkGlassHandle>(null)
  const timeOffsetSec = useLocalTimeOffset() ?? 0
  const onRemainingChangeRef = useLatestRef(onRemainingChange)
  const durationMsRef = useLatestRef(durationMs)

  useEffect(() => {
    return runCountdown(
      () => (targetEpochSec - getServerNowSec(timeOffsetSec)) * 1000,
      (remainingSec) => {
        const digits = digitsRef.current
        const milk = milkRef.current

        if (!digits || !milk) {
          return false
        }

        digits.setRemainingSec(remainingSec)

        const duration = durationMsRef.current
        milk.setFraction(duration > 0 ? (remainingSec * 1000) / duration : 0)

        onRemainingChangeRef.current?.(remainingSec)

        return true
      },
    )
  }, [targetEpochSec, timeOffsetSec, durationMsRef, onRemainingChangeRef])

  return (
    <styledEl.Row>
      <styledEl.TimerColumn>
        <CountdownDigits ref={digitsRef} />
        <styledEl.TimerLabel>{label}</styledEl.TimerLabel>
      </styledEl.TimerColumn>
      <styledEl.GlassBox>
        <MilkGlass ref={milkRef} />
      </styledEl.GlassBox>
    </styledEl.Row>
  )
}
