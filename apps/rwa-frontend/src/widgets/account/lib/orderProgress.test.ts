import { formatOrderProgress } from './orderProgress'

const NOW = 1_800_000_000

describe('formatOrderProgress', () => {
  it('counts down to the expiry', () => {
    expect(formatOrderProgress({ filledFraction: 0, validTo: NOW + 28 * 60 }, NOW)).toBe('Expires in 28 min')
  })

  it('rounds the minutes up', () => {
    expect(formatOrderProgress({ filledFraction: 0, validTo: NOW + 27 * 60 + 1 }, NOW)).toBe('Expires in 28 min')
  })

  it('shows hours and days for later expiries', () => {
    expect(formatOrderProgress({ filledFraction: 0, validTo: NOW + 6 * 3600 + 120 }, NOW)).toBe('Expires in 6h')
    expect(formatOrderProgress({ filledFraction: 0, validTo: NOW + 3 * 86_400 }, NOW)).toBe('Expires in 3d')
  })

  it('shows the filled part and the time left of a partly filled order', () => {
    expect(formatOrderProgress({ filledFraction: 0.25, validTo: NOW + 6 * 3600 }, NOW)).toBe('25% filled · 6h left')
  })

  it('keeps a minute for an order past its expiry the order book still lists as open', () => {
    expect(formatOrderProgress({ filledFraction: 0, validTo: NOW - 30 }, NOW)).toBe('Expires in 1 min')
  })
})
