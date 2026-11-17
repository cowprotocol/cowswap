import { ReactNode, useEffect, useRef, useState } from 'react'

import { runCountdown, useLatestRef, useLocalTimeOffset } from '@cowprotocol/common-hooks'
import { getServerNowSec } from '@cowprotocol/common-utils'

import { CountdownDigits } from './CountdownDigits/CountdownDigits.pure'
import { MilkGlass, MilkGlassHandle } from './MilkGlass/MilkGlass.pure'
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
  const milkRef = useRef<MilkGlassHandle>(null)
  const timeOffsetSec = useLocalTimeOffset() ?? 0
  const onRemainingChangeRef = useLatestRef(onRemainingChange)
  const durationMsRef = useLatestRef(durationMs)
  const [remainingSec, setRemainingSec] = useState(() => Math.max(0, targetEpochSec - getServerNowSec(timeOffsetSec)))

  useEffect(() => {
    return runCountdown(
      () => (targetEpochSec - getServerNowSec(timeOffsetSec)) * 1000,
      (nextRemainingSec) => {
        const milk = milkRef.current
        if (!milk) {
          return false
        }

        const duration = durationMsRef.current
        milk.setFraction(duration > 0 ? (nextRemainingSec * 1000) / duration : 0)
        setRemainingSec(nextRemainingSec)
        onRemainingChangeRef.current?.(nextRemainingSec)

        return true
      },
    )
  }, [targetEpochSec, timeOffsetSec, durationMsRef, onRemainingChangeRef])

  return (
    <styledEl.Row>
      <styledEl.TimerColumn>
        <CountdownDigits remainingSec={remainingSec} />
        <styledEl.TimerLabel>{label}</styledEl.TimerLabel>
      </styledEl.TimerColumn>
      <styledEl.GlassBox>
        <MilkGlass ref={milkRef} />
      </styledEl.GlassBox>
    </styledEl.Row>
  )
}
