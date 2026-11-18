import type { TickMarkType } from 'charting_library'

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
