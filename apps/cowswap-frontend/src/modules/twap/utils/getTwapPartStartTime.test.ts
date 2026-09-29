import { getTwapPartStartTime } from './getTwapPartStartTime.utils'

describe('getTwapPartStartTime', () => {
  it.each([
    [0, 300, 1299],
    [300, 300, 1299],
    [60, 300, 1059],
    [1, 300, 1000],
  ])('recovers the start with span=%s, t=%s and inclusive expiry=%s', (span, t, validTo) => {
    expect(getTwapPartStartTime(validTo, { span, t })).toBe(1000)
  })

  it('preserves a start at Unix epoch zero', () => {
    expect(getTwapPartStartTime(59, { span: 0, t: 60 })).toBe(0)
  })
})
