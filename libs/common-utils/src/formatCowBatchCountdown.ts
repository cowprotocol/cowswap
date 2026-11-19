/**
 * Formats remaining time as `MM:SS` for the post-submit auction countdown.
 */
export function formatAuctionCountdown(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  const remSeconds = seconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(remSeconds).padStart(2, '0')}`
}

/**
 * Formats a remaining duration as compact live `6m 42s` (or `42s` when under a minute).
 */
export function formatBatchCountdown(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  const remSeconds = seconds % 60

  if (minutes <= 0) {
    return `${remSeconds}s`
  }

  return `${minutes}m ${remSeconds}s`
}

const LAST_MINUTE_BUCKET_SEC = 15

/**
 * Formats remaining batch wait as a coarse approximate label (`7 min`, `45s`).
 * Minutes change once per minute; under a minute, values snap to 15s buckets.
 */
export function formatApproximateBatchCountdown(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds))

  if (seconds <= 0) {
    return '0s'
  }

  if (seconds >= 60) {
    return `${Math.ceil(seconds / 60)} min`
  }

  return `${Math.ceil(seconds / LAST_MINUTE_BUCKET_SEC) * LAST_MINUTE_BUCKET_SEC}s`
}
