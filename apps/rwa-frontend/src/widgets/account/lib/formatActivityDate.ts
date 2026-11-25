import { EMPTY_VALUE, getLocalTimeParts } from '@/shared/lib/format'

/** `16 Sep 2026 · 15:25`, `timestamp` is in Unix seconds, `timeZone` is the user's by default */
export function formatActivityDate(timestamp: number | null, timeZone?: string): string {
  if (timestamp === null) return EMPTY_VALUE

  const { day, month, year, time } = getLocalTimeParts(timestamp * 1000, timeZone)

  return `${day} ${month} ${year} · ${time}`
}
