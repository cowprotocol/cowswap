import { ReactNode, useLayoutEffect, useMemo, useRef } from 'react'

import { Plural, Trans } from '@lingui/react/macro'

import * as styledEl from './CountdownDigits.styled'

/** Leading max and trailing 0 let wraps animate one cell, then snap to the canonical copy. */
function buildReelDigits(maxDigit: number): string[] {
  const core = Array.from({ length: maxDigit + 1 }, (_, index) => String(index))
  return [String(maxDigit), ...core, '0']
}

const canonicalIndex = (digit: number): number => digit + 1

export interface CountdownDigitsProps {
  remainingSec: number
}

interface DigitReelProps {
  digit: number
  /** Inclusive upper digit on the reel. Seconds tens uses 5; others keep 0–9. */
  maxDigit?: number
}

export function CountdownDigits({ remainingSec }: CountdownDigitsProps): ReactNode {
  const totalSeconds = Math.ceil(Math.max(0, remainingSec))
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
        <DigitReel digit={Math.floor(seconds / 10)} maxDigit={5} />
        <DigitReel digit={seconds % 10} />
      </styledEl.DigitsRow>
    </>
  )
}

function DigitReel({ digit, maxDigit = 9 }: DigitReelProps): ReactNode {
  const stripRef = useRef<HTMLDivElement>(null)
  const prevDigitRef = useRef(digit)
  const { reelDigits, trailingMaxIndex, trailingZeroIndex } = useMemo(
    () => ({
      reelDigits: buildReelDigits(maxDigit),
      trailingMaxIndex: maxDigit + 1,
      trailingZeroIndex: maxDigit + 2,
    }),
    [maxDigit],
  )

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

    // Countdown wrap 0→max: step to leading max, then snap to trailing max.
    if (prevDigit === 0 && digit === maxDigit) {
      applyIndex(0, true)
      const onEnd = (event: TransitionEvent): void => {
        if (event.target !== strip || event.propertyName !== 'transform') {
          return
        }
        strip.removeEventListener('transitionend', onEnd)
        applyIndex(trailingMaxIndex, false)
      }
      strip.addEventListener('transitionend', onEnd)
      return () => strip.removeEventListener('transitionend', onEnd)
    }

    // Increase wrap max→0: step to trailing 0, then snap to canonical 0.
    if (prevDigit === maxDigit && digit === 0) {
      applyIndex(trailingZeroIndex, true)
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
    return
  }, [digit, maxDigit, trailingMaxIndex, trailingZeroIndex])

  return (
    <styledEl.ReelClip>
      <styledEl.ReelStrip ref={stripRef}>
        {reelDigits.map((value, index) => (
          <span key={`${value}-${index}`}>{value}</span>
        ))}
      </styledEl.ReelStrip>
    </styledEl.ReelClip>
  )
}
