import { forwardRef, ReactNode, RefObject, useImperativeHandle, useRef } from 'react'

import { fontFamilyBrand } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

/** Digit metrics from the Figma countdown (node 3430:13145): Bold 48.64/63.84, one 0-9 reel per digit. */
const DIGIT_FONT_SIZE_PX = 48.64
const DIGIT_LINE_HEIGHT_PX = 63.84
const DIGIT_WIDTH_PX = 33.44

const REEL_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

export interface CountdownDigitsHandle {
  setRemainingSec: (remainingSec: number) => void
}

export const CountdownDigits = forwardRef<CountdownDigitsHandle>(function CountdownDigits(_, ref): ReactNode {
  const reel0Ref = useRef<HTMLDivElement>(null)
  const reel1Ref = useRef<HTMLDivElement>(null)
  const reel2Ref = useRef<HTMLDivElement>(null)
  const reel3Ref = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    setRemainingSec(remainingSec: number) {
      const totalSeconds = Math.max(0, remainingSec)
      const minutes = Math.min(99, Math.floor(totalSeconds / 60))
      const seconds = totalSeconds % 60
      const digits = [Math.floor(minutes / 10), minutes % 10, Math.floor(seconds / 10), seconds % 10] as const
      const reels = [reel0Ref.current, reel1Ref.current, reel2Ref.current, reel3Ref.current]

      for (let i = 0; i < reels.length; i++) {
        const reel = reels[i]
        if (reel) {
          reel.style.transform = `translateY(${-digits[i] * DIGIT_LINE_HEIGHT_PX}px)`
        }
      }
    },
  }))

  return (
    <DigitsRow>
      <DigitReel reelRef={reel0Ref} />
      <DigitReel reelRef={reel1Ref} />
      <Colon>:</Colon>
      <DigitReel reelRef={reel2Ref} />
      <DigitReel reelRef={reel3Ref} />
    </DigitsRow>
  )
})

function DigitReel({ reelRef }: { reelRef: RefObject<HTMLDivElement | null> }): ReactNode {
  return (
    <ReelClip>
      <ReelStrip ref={reelRef}>
        {REEL_DIGITS.map((value) => (
          <span key={value}>{value}</span>
        ))}
      </ReelStrip>
    </ReelClip>
  )
}

const DigitsRow = styled.div`
  ${fontFamilyBrand}
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
