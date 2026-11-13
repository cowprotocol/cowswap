import { getUsMarketDay, shiftDays, type UsMarketDay } from './usMarketCalendar'

function datesOf(year: number, kind: UsMarketDay): string[] {
  const dates: string[] = []

  for (let date = { year, month: 1, day: 1 }; date.year === year; date = shiftDays(date, 1)) {
    const weekday = new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay()

    if (weekday !== 0 && weekday !== 6 && getUsMarketDay(date) === kind) {
      dates.push(`${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`)
    }
  }

  return dates
}

describe('getUsMarketDay', () => {
  it.each([
    [2026, ['01-01', '01-19', '02-16', '04-03', '05-25', '06-19', '07-03', '09-07', '11-26', '12-25']],
    [2027, ['01-01', '01-18', '02-15', '03-26', '05-31', '06-18', '07-05', '09-06', '11-25', '12-24']],
    [2028, ['01-17', '02-21', '04-14', '05-29', '06-19', '07-04', '09-04', '11-23', '12-25']],
  ])('closes on the NYSE holidays of %i', (year, holidays) => {
    expect(datesOf(year, 'closed')).toEqual(holidays)
  })

  it.each([
    [2026, ['11-27', '12-24']],
    [2027, ['11-26']],
    [2028, ['07-03', '11-24']],
  ])('closes early on the NYSE early-close days of %i', (year, earlyCloses) => {
    expect(datesOf(year, 'earlyClose')).toEqual(earlyCloses)
  })

  it('is closed on weekends', () => {
    expect(getUsMarketDay({ year: 2026, month: 11, day: 7 })).toBe('closed')
    expect(getUsMarketDay({ year: 2026, month: 11, day: 8 })).toBe('closed')
  })

  it('has no Juneteenth holiday before 2022', () => {
    expect(getUsMarketDay({ year: 2021, month: 6, day: 18 })).toBe('regular')
  })
})
