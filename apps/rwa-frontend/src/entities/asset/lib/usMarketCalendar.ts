const SUNDAY = 0
const MONDAY = 1
const THURSDAY = 4
const FRIDAY = 5
const SATURDAY = 6
const JANUARY = 1
const FEBRUARY = 2
const MAY = 5
const JUNE = 6
const JULY = 7
const SEPTEMBER = 9
const NOVEMBER = 11
const DECEMBER = 12
const DAYS_PER_WEEK = 7
const MS_PER_DAY = 86_400_000
const JUNETEENTH_FIRST_YEAR = 2022

/** Calendar date, `month` is 1-based */
export interface CalendarDate {
  year: number
  month: number
  day: number
}

export type UsMarketDay = 'closed' | 'earlyClose' | 'regular'

/**
 * NYSE/Nasdaq session kind of a New York calendar date, by the NYSE holiday rules.
 * Unscheduled closures (national days of mourning, emergencies) are not known in advance
 */
export function getUsMarketDay(date: CalendarDate): UsMarketDay {
  if (isWeekend(getWeekday(date)) || isUsMarketHoliday(date)) return 'closed'

  return isUsMarketEarlyClose(date) ? 'earlyClose' : 'regular'
}

export function shiftDays(date: CalendarDate, days: number): CalendarDate {
  const shifted = new Date(Date.UTC(date.year, date.month - 1, date.day) + days * MS_PER_DAY)

  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1, day: shifted.getUTCDate() }
}

/** Western Easter Sunday, anonymous Gregorian algorithm (Meeus/Jones/Butcher) */
function getEasterSunday(year: number): CalendarDate {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1

  return { year, month, day }
}

function getHolidays(year: number): CalendarDate[] {
  const holidays = [
    // Martin Luther King Jr. Day: third Monday of January
    nthWeekday(year, JANUARY, MONDAY, 3),
    // Washington's Birthday (Presidents' Day): third Monday of February
    nthWeekday(year, FEBRUARY, MONDAY, 3),
    // Good Friday: two days before Easter Sunday
    shiftDays(getEasterSunday(year), -2),
    // Memorial Day: last Monday of May
    lastWeekday(year, MAY, MONDAY),
    // Independence Day: July 4
    observed({ year, month: JULY, day: 4 }),
    // Labor Day: first Monday of September
    nthWeekday(year, SEPTEMBER, MONDAY, 1),
    // Thanksgiving Day: fourth Thursday of November
    nthWeekday(year, NOVEMBER, THURSDAY, 4),
    // Christmas Day: December 25
    observed({ year, month: DECEMBER, day: 25 }),
  ]
  const newYear = { year, month: JANUARY, day: 1 }

  // New Year's Day: January 1. NYSE doesn't close on the Friday before a Saturday one, it would fall in the previous year
  if (getWeekday(newYear) !== SATURDAY) holidays.push(observed(newYear))
  // Juneteenth National Independence Day: June 19, observed by NYSE since 2022
  if (year >= JUNETEENTH_FIRST_YEAR) holidays.push(observed({ year, month: JUNE, day: 19 }))

  return holidays
}

function getWeekday(date: CalendarDate): number {
  return new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay()
}

function isSameDate(a: CalendarDate, b: CalendarDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day
}

/** 1 pm ET closes: the day after Thanksgiving, and Christmas Eve and July 3 when they are trading days */
function isUsMarketEarlyClose(date: CalendarDate): boolean {
  const { year, month, day } = date
  const dayAfterThanksgiving = shiftDays(nthWeekday(year, NOVEMBER, THURSDAY, 4), 1)

  return isSameDate(date, dayAfterThanksgiving) || (month === DECEMBER && day === 24) || (month === JULY && day === 3)
}

function isUsMarketHoliday(date: CalendarDate): boolean {
  return getHolidays(date.year).some((holiday) => isSameDate(holiday, date))
}

function isWeekend(weekday: number): boolean {
  return weekday === SUNDAY || weekday === SATURDAY
}

function lastWeekday(year: number, month: number, weekday: number): CalendarDate {
  const last = new Date(Date.UTC(year, month, 0))
  const day = last.getUTCDate() - ((last.getUTCDay() - weekday + DAYS_PER_WEEK) % DAYS_PER_WEEK)

  return { year, month, day }
}

function nthWeekday(year: number, month: number, weekday: number, n: number): CalendarDate {
  const first = getWeekday({ year, month, day: 1 })
  const day = 1 + ((weekday - first + DAYS_PER_WEEK) % DAYS_PER_WEEK) + (n - 1) * DAYS_PER_WEEK

  return { year, month, day }
}

/** A Saturday holiday is observed on Friday, a Sunday one on Monday */
function observed(date: CalendarDate): CalendarDate {
  const weekday = getWeekday(date)

  if (weekday === SATURDAY) return shiftDays(date, FRIDAY - SATURDAY)
  if (weekday === SUNDAY) return shiftDays(date, MONDAY - SUNDAY)

  return date
}
