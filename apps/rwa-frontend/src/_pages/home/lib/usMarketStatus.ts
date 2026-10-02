import type { RwaTradingTime } from '@/entities/asset'

const MINUTES_PER_HOUR = 60
const SUNDAY = 0
const SATURDAY = 6

/** Weekdays within `tradingTime`, market holidays are not taken into account */
export function isUsMarketOpen(tradingTime: RwaTradingTime, now: Date): boolean {
  const day = now.getUTCDay()

  if (day === SUNDAY || day === SATURDAY) return false

  const start = parseUtcMinutes(tradingTime.start)
  const end = parseUtcMinutes(tradingTime.end)

  if (start === null || end === null) return false

  const minutes = now.getUTCHours() * MINUTES_PER_HOUR + now.getUTCMinutes()

  return minutes >= start && minutes < end
}

/** `HH:mm UTC` to minutes since midnight */
function parseUtcMinutes(time: string): number | null {
  const match = /^(\d{2}):(\d{2}) UTC$/.exec(time)

  if (!match) return null

  return Number(match[1]) * MINUTES_PER_HOUR + Number(match[2])
}
