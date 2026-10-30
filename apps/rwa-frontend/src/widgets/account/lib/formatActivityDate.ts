import { EMPTY_VALUE } from '@/shared/lib/format'

// `en-GB` writes September as "Sept" in recent ICU, so the "16 Sep" order is built from `en-US` parts
const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'UTC',
})

/** `16 Sep · 15:25 UTC`, `timestamp` is in Unix seconds */
export function formatActivityDate(timestamp: number | null): string {
  if (timestamp === null) return EMPTY_VALUE

  const parts = Object.fromEntries(
    dateTimeFormatter.formatToParts(timestamp * 1000).map(({ type, value }) => [type, value]),
  )

  return `${parts.day} ${parts.month} · ${parts.hour}:${parts.minute} UTC`
}
