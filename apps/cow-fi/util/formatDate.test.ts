import { formatDate } from './formatDate'

describe('formatDate', () => {
  it('formats dates in UTC so server and client hydration match', () => {
    expect(formatDate(new Date('2026-01-08T14:03:00.000Z'))).toBe('Jan 8, 2026, 2:03 PM')
  })
})
