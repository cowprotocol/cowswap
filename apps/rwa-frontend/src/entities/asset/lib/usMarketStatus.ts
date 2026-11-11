import type { RwaTradingTime } from '../model/types'

const MS_PER_MINUTE = 60_000
const MINUTES_PER_HOUR = 60
const MAX_DAYS_TO_NEXT_OPEN = 7
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const SUNDAY = 0
const SATURDAY = 6

interface ZonedDate {
  year: number
  month: number
  day: number
  weekday: number
  minutes: number
}

/** Minutes until the market closes while it's open, or until it next opens. `null` for an unparsable `tradingTime` */
export function getMinutesToUsMarketChange(tradingTime: RwaTradingTime, now: Date): number | null {
  const session = parseSession(tradingTime)

  if (!session) return null

  const { start, end, timeZone } = session
  const local = toZonedDate(now, timeZone)

  if (isOpenAt(local, start, end)) return minutesBetween(now, zonedTimeToDate(local, end, timeZone))

  for (let daysAhead = local.minutes < start ? 0 : 1; daysAhead <= MAX_DAYS_TO_NEXT_OPEN; daysAhead++) {
    const day = toZonedDate(new Date(Date.UTC(local.year, local.month - 1, local.day + daysAhead)), 'UTC')

    if (!isWeekend(day.weekday)) return minutesBetween(now, zonedTimeToDate(day, start, timeZone))
  }

  return null
}

/** Weekdays within `tradingTime` in its time zone, market holidays are not taken into account */
export function isUsMarketOpen(tradingTime: RwaTradingTime, now: Date): boolean {
  const session = parseSession(tradingTime)

  if (!session) return false

  return isOpenAt(toZonedDate(now, session.timeZone), session.start, session.end)
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone })

    return true
  } catch {
    return false
  }
}

/** `timeZone` minus UTC at `date` */
function getOffsetMs(date: Date, timeZone: string): number {
  const local = toZonedDate(date, timeZone)
  const localAsUtc = Date.UTC(local.year, local.month - 1, local.day, 0, local.minutes)

  return localAsUtc - Math.floor(date.getTime() / MS_PER_MINUTE) * MS_PER_MINUTE
}

function isOpenAt(local: ZonedDate, start: number, end: number): boolean {
  return !isWeekend(local.weekday) && local.minutes >= start && local.minutes < end
}

function isWeekend(day: number): boolean {
  return day === SUNDAY || day === SATURDAY
}

function minutesBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_MINUTE)
}

/** `HH:mm` to minutes since midnight */
function parseMinutes(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time)

  if (!match) return null

  return Number(match[1]) * MINUTES_PER_HOUR + Number(match[2])
}

function parseSession(tradingTime: RwaTradingTime): { start: number; end: number; timeZone: string } | null {
  const start = parseMinutes(tradingTime.start)
  const end = parseMinutes(tradingTime.end)

  if (start === null || end === null || !isValidTimeZone(tradingTime.timeZone)) return null

  return { start, end, timeZone: tradingTime.timeZone }
}

function toZonedDate(date: Date, timeZone: string): ZonedDate {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes): string => parts.find((item) => item.type === type)?.value ?? ''

  return {
    year: Number(part('year')),
    month: Number(part('month')),
    day: Number(part('day')),
    weekday: WEEKDAYS.indexOf(part('weekday')),
    minutes: Number(part('hour')) * MINUTES_PER_HOUR + Number(part('minute')),
  }
}

/** Wall-clock `minutes` on the `local` date in `timeZone` as an instant */
function zonedTimeToDate(local: ZonedDate, minutes: number, timeZone: string): Date {
  const wallClockAsUtc = Date.UTC(local.year, local.month - 1, local.day, 0, minutes)
  // The offset at the guess can differ from the offset at the result when a DST change falls between them
  const guess = wallClockAsUtc - getOffsetMs(new Date(wallClockAsUtc), timeZone)

  return new Date(wallClockAsUtc - getOffsetMs(new Date(guess), timeZone))
}
