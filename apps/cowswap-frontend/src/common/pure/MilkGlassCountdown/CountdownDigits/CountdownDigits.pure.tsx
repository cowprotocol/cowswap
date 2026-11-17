import { ReactNode, useLayoutEffect, useRef } from 'react'

import { Plural, Trans } from '@lingui/react/macro'

import * as styledEl from './CountdownDigits.styled'

/** Leading 9 and trailing 0 let wraps animate one cell, then snap to the canonical copy. */
const REEL_DIGITS = ['9', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as const

const canonicalIndex = (digit: number): number => digit + 1

export interface CountdownDigitsProps {
  remainingSec: number
}

export function CountdownDigits({ remainingSec }: CountdownDigitsProps): ReactNode {
  const totalSeconds = Math.max(0, remainingSec)
  const minutes = Math.min(99, Math.floor(totalSeconds / 60))
  const seconds = totalSeconds % 60

  return (
    <>
      <styledEl.VisuallyHidden role="timer" aria-live="polite" aria-atomic="true">
        {minutes > 0 ? (
          <>
            <Plural value={minutes} one="# minute" other="# minutes" />{' '}
            <Plural value={seconds} one="# second" other="# seconds" /> <Trans>remaining</Trans>
          </>
        ) : (
          <Plural value={seconds} one="# second remaining" other="# seconds remaining" />
        )}
      </styledEl.VisuallyHidden>
      <styledEl.DigitsRow aria-hidden="true">
        <DigitReel digit={Math.floor(minutes / 10)} />
        <DigitReel digit={minutes % 10} />
        <styledEl.Colon>:</styledEl.Colon>
        <DigitReel digit={Math.floor(seconds / 10)} />
        <DigitReel digit={seconds % 10} />
      </styledEl.DigitsRow>
    </>
  )
}

function DigitReel({ digit }: { digit: number }): ReactNode {
  const stripRef = useRef<HTMLDivElement>(null)
  const prevDigitRef = useRef(digit)

  useLayoutEffect(() => {
    const strip = stripRef.current
    if (!strip) {
      return
    }

    const prevDigit = prevDigitRef.current
    prevDigitRef.current = digit

    const applyIndex = (index: number, animate: boolean): void => {
      if (!animate) {
        strip.style.transition = 'none'
      }
      strip.style.transform = `translateY(${-index * styledEl.DIGIT_LINE_HEIGHT_PX}px)`
      if (!animate) {
        void strip.offsetHeight
        strip.style.transition = ''
      }
    }

    if (prevDigit === digit) {
      applyIndex(canonicalIndex(digit), false)
      return
    }

    // Countdown wrap 0→9: step to leading 9, then snap to trailing 9.
    if (prevDigit === 0 && digit === 9) {
      applyIndex(0, true)
      const onEnd = (event: TransitionEvent): void => {
        if (event.target !== strip || event.propertyName !== 'transform') {
          return
        }
        strip.removeEventListener('transitionend', onEnd)
        applyIndex(10, false)
      }
      strip.addEventListener('transitionend', onEnd)
      return () => strip.removeEventListener('transitionend', onEnd)
    }

    // Increase wrap 9→0: step to trailing 0, then snap to canonical 0.
    if (prevDigit === 9 && digit === 0) {
      applyIndex(11, true)
      const onEnd = (event: TransitionEvent): void => {
        if (event.target !== strip || event.propertyName !== 'transform') {
          return
        }
        strip.removeEventListener('transitionend', onEnd)
        applyIndex(1, false)
      }
      strip.addEventListener('transitionend', onEnd)
      return () => strip.removeEventListener('transitionend', onEnd)
    }

    applyIndex(canonicalIndex(digit), true)
  }, [digit])

  return (
    <styledEl.ReelClip>
      <styledEl.ReelStrip ref={stripRef}>
        {REEL_DIGITS.map((value, index) => (
          <span key={`${value}-${index}`}>{value}</span>
        ))}
      </styledEl.ReelStrip>
    </styledEl.ReelClip>
  )
}
