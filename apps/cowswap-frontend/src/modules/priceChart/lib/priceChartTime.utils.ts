import { formatDateTime } from '@cowprotocol/common-utils'

import { TickMarkType } from 'lightweight-charts'

import type { TickMarkFormatter, Time } from 'lightweight-charts'

export function createPriceChartTimeFormatters(locale: string): {
  tickMarkFormatter: TickMarkFormatter
  timeFormatter: (time: Time) => string
} {
  const formatters = {
    [TickMarkType.Year]: new Intl.DateTimeFormat(locale, { year: 'numeric' }),
    [TickMarkType.Month]: new Intl.DateTimeFormat(locale, { month: 'short' }),
    [TickMarkType.DayOfMonth]: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }),
    [TickMarkType.Time]: new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }),
    [TickMarkType.TimeWithSeconds]: new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }),
  }

  return {
    tickMarkFormatter: (time, tickMarkType) =>
      typeof time === 'number' ? formatters[tickMarkType].format(time * 1000) : null,
    timeFormatter: (time) => (typeof time === 'number' ? formatDateTime(time * 1000, locale) : ''),
  }
}
