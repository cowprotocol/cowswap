import { isUsMarketOpen } from './usMarketStatus'

const US_HOURS = { title: 'US market open', start: '13:30 UTC', end: '20:00 UTC' }

describe('isUsMarketOpen', () => {
  it.each([
    ['2026-10-01T14:00:00Z', true],
    ['2026-10-01T13:30:00Z', true],
    ['2026-10-01T13:29:59Z', false],
    ['2026-10-01T19:59:00Z', true],
    ['2026-10-01T20:00:00Z', false],
    ['2026-10-03T15:00:00Z', false],
  ])('%s → %s', (now, expected) => {
    expect(isUsMarketOpen(US_HOURS, new Date(now))).toBe(expected)
  })

  it('is closed for an unparsable trading time', () => {
    expect(isUsMarketOpen({ ...US_HOURS, start: '9am' }, new Date('2026-10-01T14:00:00Z'))).toBe(false)
  })
})
