import { plural, t } from '@lingui/core/macro'

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
    return formatCountdownSeconds(remSeconds)
  }

  // eslint-disable-next-line lingui/no-single-variables-to-translate -- plural() inlines into one ICU message; the rule only sees the joining space
  return t`${plural(minutes, {
    one: '#m',
    few: '#m',
    many: '#m',
    other: '#m',
  })} ${plural(remSeconds, {
    one: '#s',
    few: '#s',
    many: '#s',
    other: '#s',
  })}`
}

const LAST_MINUTE_BUCKET_SEC = 15

/**
 * Formats remaining batch wait as a coarse approximate label (`~7 min`, `~45s`).
 * Minutes change once per minute; under a minute, values snap to 15s buckets.
 */
export function formatApproximateBatchCountdown(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds))

  if (seconds <= 0) {
    return `~${formatCountdownSeconds(0)}`
  }

  if (seconds >= 60) {
    const minutes = Math.ceil(seconds / 60)

    return `~${plural(minutes, {
      one: '# min',
      few: '# min',
      many: '# min',
      other: '# min',
    })}`
  }

  return `~${formatCountdownSeconds(Math.ceil(seconds / LAST_MINUTE_BUCKET_SEC) * LAST_MINUTE_BUCKET_SEC)}`
}

function formatCountdownSeconds(seconds: number): string {
  return plural(seconds, {
    one: '#s',
    few: '#s',
    many: '#s',
    other: '#s',
  })
}
