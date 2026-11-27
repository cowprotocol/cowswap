import { COW_BATCH_TIME_SECONDS } from '@cowprotocol/common-const'

/**
 * Next canonical-batch `validFrom` (unix seconds).
 * `nowSec` should be server-adjusted when a quote time offset is available:
 * `Date.now() / 1000 - timeOffset`.
 */
export function getCowBatchValidFrom(nowSec: number, batchTimeSec: number = COW_BATCH_TIME_SECONDS): number {
  const interval = batchTimeSec
  let validFrom = Math.floor((nowSec + batchTimeSec) / interval) * interval

  if (validFrom <= nowSec) {
    validFrom += interval
  }

  return validFrom
}

/** Local wall clock adjusted by quote-derived skew (seconds). */
export function getServerNowSec(timeOffsetSec: number | undefined = 0): number {
  return Date.now() / 1000 - (timeOffsetSec ?? 0)
}
