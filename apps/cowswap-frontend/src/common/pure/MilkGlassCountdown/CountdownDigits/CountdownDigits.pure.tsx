import { ReactNode } from 'react'

import * as styledEl from './CountdownDigits.styled'

const REEL_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

export interface CountdownDigitsProps {
  remainingSec: number
}

export function CountdownDigits({ remainingSec }: CountdownDigitsProps): ReactNode {
  const totalSeconds = Math.max(0, remainingSec)
  const minutes = Math.min(99, Math.floor(totalSeconds / 60))
  const seconds = totalSeconds % 60

  return (
    <styledEl.DigitsRow>
      <DigitReel digit={Math.floor(minutes / 10)} />
      <DigitReel digit={minutes % 10} />
      <styledEl.Colon>:</styledEl.Colon>
      <DigitReel digit={Math.floor(seconds / 10)} />
      <DigitReel digit={seconds % 10} />
    </styledEl.DigitsRow>
  )
}

function DigitReel({ digit }: { digit: number }): ReactNode {
  return (
    <styledEl.ReelClip>
      <styledEl.ReelStrip style={{ transform: `translateY(${-digit * styledEl.DIGIT_LINE_HEIGHT_PX}px)` }}>
        {REEL_DIGITS.map((value) => (
          <span key={value}>{value}</span>
        ))}
      </styledEl.ReelStrip>
    </styledEl.ReelClip>
  )
}
