import { formatDate } from './format'

describe('formatDate', () => {
  it('formats an ISO date as day, short month and year in UTC', () => {
    expect(formatDate('2026-09-14T23:30:00.000Z')).toBe('14 Sep 2026')
  })

  it('returns a dash for a missing or invalid date', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate('soon')).toBe('—')
  })
})
