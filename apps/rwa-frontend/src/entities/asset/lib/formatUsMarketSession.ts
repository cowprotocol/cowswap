import { getUsMarketSessionInstants } from './usMarketStatus'

import type { RwaTradingTime } from '../model/types'

export interface UsMarketSessionLabels {
  /** `15:30 – 22:00` */
  regular: string
  /** `15:30 – 19:00` */
  earlyClose: string
  /** City of `timeZone`, e.g. `Lisbon` */
  city: string
}

/** The `tradingTime` session of the `now` date in `timeZone`. `null` for an unparsable `tradingTime` */
export function formatUsMarketSession(
  tradingTime: RwaTradingTime,
  now: Date,
  timeZone: string,
): UsMarketSessionLabels | null {
  const instants = getUsMarketSessionInstants(tradingTime, now)

  if (!instants) return null

  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  })
  const dayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone })
  const formatRange = (start: Date, end: Date): string => {
    const nextDay = dayFormatter.format(start) !== dayFormatter.format(end) ? ' next day' : ''

    return `${timeFormatter.format(start)} – ${timeFormatter.format(end)}${nextDay}`
  }

  return {
    regular: formatRange(instants.start, instants.end),
    earlyClose: formatRange(instants.start, instants.earlyCloseEnd),
    city: getTimeZoneCity(timeZone),
  }
}

export function getTimeZoneCity(timeZone: string): string {
  return (timeZone.split('/').pop() ?? timeZone).replace(/_/g, ' ')
}
