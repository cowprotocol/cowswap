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
  const toMinutes = (seconds: number): number => Math.max(1, Math.ceil(seconds / 60))

  if (now < startTime) {
    return {
      isScheduled: true,
      part: 1,
      partsCount,
      minutesLeft: toMinutes(startTime - now),
      isLastPart: partsCount === 1,
    }
  }

  const nextIndex = Math.floor((now - startTime) / interval) + 1

  if (nextIndex < partsCount) {
    return {
      isScheduled: false,
      part: nextIndex + 1,
      partsCount,
      minutesLeft: toMinutes(startTime + nextIndex * interval - now),
      isLastPart: false,
    }
  }

  return {
    isScheduled: false,
    part: partsCount,
    partsCount,
    minutesLeft: toMinutes(startTime + partsCount * interval - now),
    isLastPart: true,
  }
}
