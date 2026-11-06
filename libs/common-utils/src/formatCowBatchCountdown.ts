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
 * Formats a remaining duration as compact `6m 42s` (or `42s` when under a minute).
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
