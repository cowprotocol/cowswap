/** Local wall clock adjusted by quote-derived skew (seconds). */
export function getServerNowSec(timeOffsetSec: number | undefined = 0): number {
  return Date.now() / 1000 - (timeOffsetSec ?? 0)
}
