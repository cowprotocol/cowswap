import type { RwaTradingTime } from '../model/types'

const MINUTES_PER_HOUR = 60
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR
const DAYS_PER_WEEK = 7
const SUNDAY = 0
const SATURDAY = 6

/** Minutes until the market closes while it's open, or until it next opens. `null` for an unparsable `tradingTime` */
export function getMinutesToUsMarketChange(tradingTime: RwaTradingTime, now: Date): number | null {
  const start = parseUtcMinutes(tradingTime.start)
  const end = parseUtcMinutes(tradingTime.end)

  if (start === null || end === null) return null

  const minutes = now.getUTCHours() * MINUTES_PER_HOUR + now.getUTCMinutes()

  if (isUsMarketOpen(tradingTime, now)) return end - minutes

  let daysAhead = minutes < start ? 0 : 1

  while (isWeekend((now.getUTCDay() + daysAhead) % DAYS_PER_WEEK)) daysAhead++

  return daysAhead * MINUTES_PER_DAY + start - minutes
}

/** Weekdays within `tradingTime`, market holidays are not taken into account */
export function isUsMarketOpen(tradingTime: RwaTradingTime, now: Date): boolean {
  if (isWeekend(now.getUTCDay())) return false

  const start = parseUtcMinutes(tradingTime.start)
  const end = parseUtcMinutes(tradingTime.end)

  if (start === null || end === null) return false

  const minutes = now.getUTCHours() * MINUTES_PER_HOUR + now.getUTCMinutes()

  return minutes >= start && minutes < end
}

function isWeekend(day: number): boolean {
  return day === SUNDAY || day === SATURDAY
}

/** `HH:mm UTC` to minutes since midnight */
function parseUtcMinutes(time: string): number | null {
  const match = /^(\d{2}):(\d{2}) UTC$/.exec(time)

  if (!match) return null

  return Number(match[1]) * MINUTES_PER_HOUR + Number(match[2])
}
