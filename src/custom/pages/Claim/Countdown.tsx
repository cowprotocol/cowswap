// Sort of a mod of but not quite from src/pages/Earn/Countdown.tsx
import { useEffect, useState } from 'react'

const MINUTE = 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24

export type Props = {
  start: number
  end: number
}

/**
 * Copied over from src/pages/Earn/Countdown.tsx and heavily modified it
 *
 * If current time is past end time, returns null
 *
 * @param start start time in ms
 * @param end end time in ms
 */
export function Countdown({ start, end }: Props) {
  // get current time, store as seconds because 🤷
  const [time, setTime] = useState(() => Math.floor(Date.now() / 1000))

  useEffect((): (() => void) | void => {
    // we only need to tick if not ended yet
    if (time <= end / 1000) {
      const timeout = setTimeout(() => setTime(Math.floor(Date.now() / 1000)), 1000)
      return () => {
        clearTimeout(timeout)
      }
    }
  }, [time, end])

  const timeUntilGenesis = start / 1000 - time
  const timeUntilEnd = end / 1000 - time

  let timeRemaining: number
  if (timeUntilGenesis >= 0) {
    timeRemaining = timeUntilGenesis
  } else {
    const ongoing = timeUntilEnd >= 0
    if (ongoing) {
      timeRemaining = timeUntilEnd
    } else {
      timeRemaining = Infinity
    }
  }

  const days = (timeRemaining - (timeRemaining % DAY)) / DAY
  timeRemaining -= days * DAY
  const hours = (timeRemaining - (timeRemaining % HOUR)) / HOUR
  timeRemaining -= hours * HOUR
  const minutes = (timeRemaining - (timeRemaining % MINUTE)) / MINUTE
  timeRemaining -= minutes * MINUTE
  const seconds = timeRemaining

  return (
    <>
      {Number.isFinite(timeRemaining)
        ? `${days} days, ${hours.toString().padStart(2, '0')}h, ${minutes.toString().padStart(2, '0')}m, ${seconds
            .toString()
            .padStart(2, '0')}s`
        : 'No longer claimable'}
    </>
  )
}
