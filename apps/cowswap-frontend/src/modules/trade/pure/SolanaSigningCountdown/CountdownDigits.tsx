import { ReactNode } from 'react'

import styled from 'styled-components/macro'

/** Digit metrics from the Figma countdown (node 3430:13145): Bold 48.64/63.84, one 0-9 reel per digit. */
const DIGIT_FONT_SIZE_PX = 48.64
const DIGIT_LINE_HEIGHT_PX = 63.84
const DIGIT_WIDTH_PX = 33.44

const REEL_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

export interface CountdownDigitsProps {
  remainingMs: number
}

export function CountdownDigits({ remainingMs }: CountdownDigitsProps): ReactNode {
  const totalSeconds = Math.ceil(remainingMs / 1000)
  const minutes = Math.min(99, Math.floor(totalSeconds / 60))
  const seconds = totalSeconds % 60

  return (
    <DigitsRow>
      <DigitReel digit={Math.floor(minutes / 10)} />
      <DigitReel digit={minutes % 10} />
      <Colon>:</Colon>
      <DigitReel digit={Math.floor(seconds / 10)} />
      <DigitReel digit={seconds % 10} />
    </DigitsRow>
  )
}

function DigitReel({ digit }: { digit: number }): ReactNode {
  return (
    <ReelClip>
      <ReelStrip style={{ transform: `translateY(${-digit * DIGIT_LINE_HEIGHT_PX}px)` }}>
        {REEL_DIGITS.map((value) => (
          <span key={value}>{value}</span>
        ))}
      </ReelStrip>
    </ReelClip>
  )
}

const DigitsRow = styled.div`
  display: flex;
  align-items: center;
  font-size: ${DIGIT_FONT_SIZE_PX}px;
  font-weight: 700;
  line-height: ${DIGIT_LINE_HEIGHT_PX}px;
  font-variant-numeric: tabular-nums;
`

const ReelClip = styled.div`
  height: ${DIGIT_LINE_HEIGHT_PX}px;
  width: ${DIGIT_WIDTH_PX}px;
  overflow: hidden;
`

const ReelStrip = styled.div`
  display: flex;
  flex-direction: column;
  transition: transform 0.4s ease-out;

  > span {
    display: block;
    height: ${DIGIT_LINE_HEIGHT_PX}px;
    text-align: center;
  }
`

const Colon = styled.span`
  width: ${DIGIT_WIDTH_PX / 2}px;
  text-align: center;
`
