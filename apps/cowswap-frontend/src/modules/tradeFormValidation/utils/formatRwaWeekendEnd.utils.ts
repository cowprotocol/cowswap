const SUNDAY = 0
const DAYS_PER_WEEK = 7

/**
 * Sunday 23:59 UTC of the weekend `now` falls in, in `timeZone`: `Monday 08:59 GMT+9`.
 * `timeZone` defaults to the user's time zone
 */
export function formatRwaWeekendEnd(now: Date, timeZone?: string): string {
  const daysToSunday = (SUNDAY - now.getUTCDay() + DAYS_PER_WEEK) % DAYS_PER_WEEK
  const weekendEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysToSunday, 23, 59),
  )
  const parts = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'short',
    timeZone,
  }).formatToParts(weekendEnd)
  const part = (type: Intl.DateTimeFormatPartTypes): string => parts.find((item) => item.type === type)?.value ?? ''

  return `${part('weekday')} ${part('hour')}:${part('minute')} ${part('timeZoneName')}`
}
