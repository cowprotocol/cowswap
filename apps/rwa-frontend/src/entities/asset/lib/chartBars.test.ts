import { alignCandles, pointsToCandles } from './chartBars'

describe('pointsToCandles', () => {
  it('turns every point into a flat candle', () => {
    expect(pointsToCandles([{ time: 60, value: 5 }])).toEqual([{ time: 60, open: 5, high: 5, low: 5, close: 5 }])
  })
})

describe('alignCandles', () => {
  it('moves candles to the start of their bar', () => {
    expect(alignCandles(pointsToCandles([{ time: 3_610, value: 5 }]), '60')).toEqual([
      { time: 3_600, open: 5, high: 5, low: 5, close: 5 },
    ])
  })

  it('merges candles of the same bar', () => {
    const points = [
      { time: 86_400 * 2, value: 10 },
      { time: 86_400 * 2 + 100, value: 14 },
      { time: 86_400 * 2 + 200, value: 8 },
      { time: 86_400 * 2 + 300, value: 12 },
      { time: 86_400 * 3 + 5, value: 13 },
    ]

    expect(alignCandles(pointsToCandles(points), '1D')).toEqual([
      { time: 86_400 * 2, open: 10, high: 14, low: 8, close: 12 },
      { time: 86_400 * 3, open: 13, high: 13, low: 13, close: 13 },
    ])
  })
})
