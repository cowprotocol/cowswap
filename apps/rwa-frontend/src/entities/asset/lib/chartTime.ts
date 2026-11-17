import type { CustomAliasedTimezone, CustomTimezoneId, TickMarkType } from 'charting_library'

const TICK_MARK_FORMATTERS: Record<TickMarkType, Intl.DateTimeFormat> = {
  Year: new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: 'UTC' }),
  Month: new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }),
  DayOfMonth: new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
  Time: new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'UTC' }),
  TimeWithSeconds: new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZone: 'UTC',
  }),
  TimeWithMilliseconds: new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZone: 'UTC',
  }),
}

/**
 * Time axis label: `3 Nov` for a new day instead of TradingView's bare `3`.
 * TradingView passes `date` already shifted to the chart time zone, so it's read in UTC
 */
export function formatTickMark(date: Date, tickMarkType: TickMarkType): string {
  const formatter = TICK_MARK_FORMATTERS[tickMarkType]

  if (tickMarkType !== 'DayOfMonth') return formatter.format(date)

  const parts = Object.fromEntries(formatter.formatToParts(date).map(({ type, value }) => [type, value]))

  return `${parts.day} ${parts.month}`
}

/**
 * The user's time zone as a TradingView custom time zone, for a zone TradingView doesn't list.
 * `offsetMinutes` is `Date.getTimezoneOffset()`: positive west of UTC, like the inverted sign of the `Etc/GMT` zones
 */
export function getCustomTimezone(timezone: string, offsetMinutes: number): CustomAliasedTimezone {
  const absoluteOffset = Math.abs(offsetMinutes)
  const hours = Math.floor(absoluteOffset / 60)
  const minutes = absoluteOffset % 60
  const alias = `Etc/GMT${offsetMinutes >= 0 ? '+' : '-'}${hours}` as const

  return {
    id: `${timezone}-local` as CustomTimezoneId,
    alias: minutes ? `${alias}:${minutes}` : alias,
    title: timezone,
  }
}
