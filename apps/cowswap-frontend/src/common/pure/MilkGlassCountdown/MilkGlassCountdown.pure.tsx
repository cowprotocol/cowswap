import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { runCountdown, useLatestRef, useLocalTimeOffset } from '@cowprotocol/common-hooks'
import { getServerNowSec } from '@cowprotocol/common-utils'

import { CountdownDigits } from './CountdownDigits/CountdownDigits.pure'
import { MilkGlass, MilkGlassHandle } from './MilkGlass/MilkGlass.pure'
import * as styledEl from './MilkGlassCountdown.styled'

const STACK_BELOW_WIDTH_PX = 400

export interface MilkGlassCountdownProps {
  /** Unix timestamp (seconds) when the countdown reaches zero. */
  targetEpochSec: number
  /** Full window length in ms, used for the milk fill level. */
  durationMs: number
  label: ReactNode
  /** Count with `Date.now()`. Default applies the quote clock offset. */
  useLocalClock?: boolean
}

export function MilkGlassCountdown({
  targetEpochSec,
  durationMs,
  label,
  useLocalClock = false,
}: MilkGlassCountdownProps): ReactNode {
  const milkRef = useRef<MilkGlassHandle>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const quoteTimeOffsetSec = useLocalTimeOffset() ?? 0
  const timeOffsetSec = useLocalClock ? 0 : quoteTimeOffsetSec
  const durationMsRef = useLatestRef(durationMs)
  const [remainingSec, setRemainingSec] = useState(() => Math.max(0, targetEpochSec - getServerNowSec(timeOffsetSec)))
  const [isStacked, setIsStacked] = useState(false)
  const [initialFraction] = useState(() => {
    const remaining = Math.max(0, targetEpochSec - getServerNowSec(timeOffsetSec))
    return durationMs > 0 ? Math.min(1, (remaining * 1000) / durationMs) : 0
  })

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

        return true
      },
    )
  }, [targetEpochSec, timeOffsetSec, durationMsRef])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) {
      return
    }

    const measure = (): void => {
      const nextStacked = root.clientWidth < STACK_BELOW_WIDTH_PX
      setIsStacked((prev) => (prev === nextStacked ? prev : nextStacked))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  return (
    <styledEl.Root ref={rootRef}>
      <styledEl.Row $stacked={isStacked}>
        <styledEl.TimerColumn $stacked={isStacked}>
          <CountdownDigits remainingSec={remainingSec} />
          <styledEl.TimerLabel>{label}</styledEl.TimerLabel>
        </styledEl.TimerColumn>
        <styledEl.GlassBox $stacked={isStacked}>
          <MilkGlass ref={milkRef} fraction={initialFraction} />
        </styledEl.GlassBox>
      </styledEl.Row>
    </styledEl.Root>
  )
}
