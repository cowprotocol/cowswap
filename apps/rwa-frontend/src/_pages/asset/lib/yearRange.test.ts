import { getYearRange } from './yearRange'

const DAY = 24 * 60 * 60
const NOW = Date.UTC(2026, 9, 30) / 1000

describe('getYearRange', () => {
  it('is null without points', () => {
    expect(getYearRange([])).toBeNull()
  })

  it('spans the lowest and highest point of a full year', () => {
    const points = [
      { time: NOW - 365 * DAY, value: 164.27 },
      { time: NOW - 100 * DAY, value: 236.54 },
      { time: NOW, value: 225 },
    ]

    expect(getYearRange(points)).toEqual({ low: 164.27, high: 236.54, since: null })
  })

  it('tells when the series starts within the year', () => {
    const points = [
      { time: NOW - 120 * DAY, value: 180 },
      { time: NOW, value: 225 },
    ]

    expect(getYearRange(points)).toEqual({ low: 180, high: 225, since: NOW - 120 * DAY })
  })
})
