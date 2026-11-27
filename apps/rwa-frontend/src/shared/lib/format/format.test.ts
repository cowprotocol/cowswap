import { formatDate, formatDuration } from './format'

describe('formatDate', () => {
  it('formats an ISO date as day, short month and year in UTC', () => {
    expect(formatDate('2026-09-14T23:30:00.000Z')).toBe('14 Sep 2026')
  })

  it('returns a dash for a missing or invalid date', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate('soon')).toBe('—')
  })
})

describe('formatDuration', () => {
  it('formats minutes, then whole hours, then whole days', () => {
    expect(formatDuration(24)).toBe('24 min')
    expect(formatDuration(150)).toBe('2h')
    expect(formatDuration(3 * 24 * 60 + 5)).toBe('3d')
  })
})
