import { formatActivityDate } from './formatActivityDate'

describe('formatActivityDate', () => {
  it('formats the date and the time in UTC', () => {
    expect(formatActivityDate(Date.UTC(2026, 8, 16, 15, 5) / 1000, 'UTC')).toBe('16 Sep 2026 · 15:05 UTC')
  })

  it('tells trades of different years apart', () => {
    expect(formatActivityDate(Date.UTC(2025, 11, 17, 11, 29) / 1000, 'UTC')).toBe('17 Dec 2025 · 11:29 UTC')
  })

  it('takes the date and year of the given time zone', () => {
    expect(formatActivityDate(Date.UTC(2025, 11, 31, 23, 30) / 1000, 'UTC')).toBe('31 Dec 2025 · 23:30 UTC')
    expect(formatActivityDate(Date.UTC(2025, 11, 31, 23, 30) / 1000, 'Asia/Tokyo')).toBe('1 Jan 2026 · 08:30 GMT+9')
  })

  it('formats in a time zone behind UTC', () => {
    expect(formatActivityDate(Date.UTC(2026, 8, 16, 15, 5) / 1000, 'America/Los_Angeles')).toBe(
      '16 Sep 2026 · 08:05 PDT',
    )
  })

  it('writes midnight as 00', () => {
    expect(formatActivityDate(Date.UTC(2026, 8, 16) / 1000, 'UTC')).toBe('16 Sep 2026 · 00:00 UTC')
  })

  it('returns the empty value without a timestamp', () => {
    expect(formatActivityDate(null)).toBe('—')
  })
})
