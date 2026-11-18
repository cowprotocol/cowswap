import { formatTickMark } from './chartTime'

describe('formatTickMark', () => {
  const date = new Date(Date.UTC(2026, 10, 3, 9, 5, 7))

  it('names the month of a new day', () => {
    expect(formatTickMark(date, 'DayOfMonth')).toBe('3 Nov')
  })

  it('formats months, years and times', () => {
    expect(formatTickMark(date, 'Month')).toBe('Nov')
    expect(formatTickMark(date, 'Year')).toBe('2026')
    expect(formatTickMark(date, 'Time')).toBe('09:05')
    expect(formatTickMark(date, 'TimeWithSeconds')).toBe('09:05:07')
  })

  it('reads the date in UTC, as TradingView already shifted it to the chart time zone', () => {
    expect(formatTickMark(new Date(Date.UTC(2026, 10, 3, 23, 30)), 'DayOfMonth')).toBe('3 Nov')
    expect(formatTickMark(new Date(Date.UTC(2026, 10, 3, 0, 0)), 'Time')).toBe('00:00')
  })
})
