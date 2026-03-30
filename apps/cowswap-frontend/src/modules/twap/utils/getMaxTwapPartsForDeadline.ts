import { MINIMUM_PART_TIME } from '../const'

/**
 * Returns the largest parts count that still keeps `ceil(totalDuration / parts) >= MINIMUM_PART_TIME`.
 */
export function getMaxTwapPartsForDeadline(totalDurationSeconds: number): number {
  const safeDuration = Math.max(0, totalDurationSeconds)

  if (safeDuration === 0) return 1

  const threshold = Math.max(1, MINIMUM_PART_TIME - 1)
  const maxParts = Math.ceil(safeDuration / threshold) - 1

  return Math.max(1, maxParts)
}
