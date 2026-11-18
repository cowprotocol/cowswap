export interface TwapProgress {
  /** No part has started yet */
  isScheduled: boolean
  /** 1-based: the next part, or the last one once it has started */
  part: number
  partsCount: number
  /** Until `part` starts, or until the last part ends */
  minutesLeft: number
  isLastPart: boolean
}

export interface TwapSchedule {
  /** Unix seconds */
  startTime: number
  /** Seconds between parts */
  interval: number
  partsCount: number
}

/** `now` in unix seconds */
export function getTwapProgress({ startTime, interval, partsCount }: TwapSchedule, now: number): TwapProgress {
  if (now < startTime) {
    return {
      isScheduled: true,
      part: 1,
      partsCount,
      minutesLeft: toMinutesLeft(startTime - now),
      isLastPart: partsCount === 1,
    }
  }

  const nextIndex = Math.floor((now - startTime) / interval) + 1

  if (nextIndex < partsCount) {
    return {
      isScheduled: false,
      part: nextIndex + 1,
      partsCount,
      minutesLeft: toMinutesLeft(startTime + nextIndex * interval - now),
      isLastPart: false,
    }
  }

  return {
    isScheduled: false,
    part: partsCount,
    partsCount,
    minutesLeft: toMinutesLeft(startTime + partsCount * interval - now),
    isLastPart: true,
  }
}

/** Whole minutes in `seconds`, rounded up and at least 1 */
export function toMinutesLeft(seconds: number): number {
  return Math.max(1, Math.ceil(seconds / 60))
}
