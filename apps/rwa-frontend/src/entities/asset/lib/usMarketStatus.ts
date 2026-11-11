import { type CalendarDate, getUsMarketDay, shiftDays } from './usMarketCalendar'

import type { RwaTradingTime } from '../model/types'

const MS_PER_MINUTE = 60_000
const MINUTES_PER_HOUR = 60
const EARLY_CLOSE_MINUTES = 13 * MINUTES_PER_HOUR
const MAX_DAYS_TO_NEXT_OPEN = 14

interface DaySession {
  start: number
  end: number
}

interface ZonedDate extends CalendarDate {
  minutes: number
}

/** Minutes until the market closes while it's open, or until it next opens. `null` for an unparsable `tradingTime` */
export function getMinutesToUsMarketChange(tradingTime: RwaTradingTime, now: Date): number | null {
  const session = parseSession(tradingTime)

  if (!session) return null

  const { timeZone } = session
  const local = toZonedDate(now, timeZone)
  const today = getDaySession(local, session)

  if (today && isWithin(local.minutes, today)) return minutesBetween(now, zonedTimeToDate(local, today.end, timeZone))

  for (let daysAhead = 0; daysAhead <= MAX_DAYS_TO_NEXT_OPEN; daysAhead++) {
    const day = shiftDays(local, daysAhead)
    const daySession = getDaySession(day, session)

    if (daySession && (daysAhead > 0 || local.minutes < daySession.start)) {
      return minutesBetween(now, zonedTimeToDate(day, daySession.start, timeZone))
    }
  }

  return null
}

/** Within `tradingTime` in its time zone on US market trading days, closing at 1 pm on early-close days */
export function isUsMarketOpen(tradingTime: RwaTradingTime, now: Date): boolean {
  const session = parseSession(tradingTime)

  if (!session) return false

  const local = toZonedDate(now, session.timeZone)
  const daySession = getDaySession(local, session)

  return !!daySession && isWithin(local.minutes, daySession)
}

export function isValidTimeZone(timeZone: string): boolean {
  // Intl falls back to the runtime time zone when `timeZone` is undefined
  if (typeof timeZone !== 'string') return false

  try {
    new Intl.DateTimeFormat('en-US', { timeZone })

    return true
  } catch {
    return false
  }
}

function getDaySession(date: CalendarDate, { start, end }: DaySession): DaySession | null {
  const marketDay = getUsMarketDay(date)

  if (marketDay === 'closed') return null

  return { start, end: marketDay === 'earlyClose' ? Math.min(end, EARLY_CLOSE_MINUTES) : end }
}

/** `timeZone` minus UTC at `date` */
function getOffsetMs(date: Date, timeZone: string): number {
  const local = toZonedDate(date, timeZone)
  const localAsUtc = Date.UTC(local.year, local.month - 1, local.day, 0, local.minutes)

  return localAsUtc - Math.floor(date.getTime() / MS_PER_MINUTE) * MS_PER_MINUTE
}

function isWithin(minutes: number, { start, end }: DaySession): boolean {
  return minutes >= start && minutes < end
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
    hour: 'numeric',
    minute: 'numeric',
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes): string => parts.find((item) => item.type === type)?.value ?? ''

  return {
    year: Number(part('year')),
    month: Number(part('month')),
    day: Number(part('day')),
    minutes: Number(part('hour')) * MINUTES_PER_HOUR + Number(part('minute')),
  }
}

/** Wall-clock `minutes` on the `local` date in `timeZone` as an instant */
function zonedTimeToDate(local: CalendarDate, minutes: number, timeZone: string): Date {
  const wallClockAsUtc = Date.UTC(local.year, local.month - 1, local.day, 0, minutes)
  // The offset at the guess can differ from the offset at the result when a DST change falls between them
  const guess = wallClockAsUtc - getOffsetMs(new Date(wallClockAsUtc), timeZone)

  return new Date(wallClockAsUtc - getOffsetMs(new Date(guess), timeZone))
}
