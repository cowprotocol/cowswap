import { formatActivityDate } from './formatActivityDate'

describe('formatActivityDate', () => {
  it('formats the day and the UTC time', () => {
    expect(formatActivityDate(Date.UTC(2026, 8, 16, 15, 5) / 1000)).toBe('16 Sep · 15:05 UTC')
  })

  it('writes midnight as 00', () => {
    expect(formatActivityDate(Date.UTC(2026, 8, 16) / 1000)).toBe('16 Sep · 00:00 UTC')
  })

  it('returns the empty value without a timestamp', () => {
    expect(formatActivityDate(null)).toBe('—')
  })
})
