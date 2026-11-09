import { alignCandles, pointsToCandles, withLatestPrice } from './chartBars'

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

describe('withLatestPrice', () => {
  const CANDLES = [
    { time: 0, open: 10, high: 12, low: 9, close: 11 },
    { time: 900, open: 11, high: 13, low: 10, close: 12 },
  ]
  const AT_1800 = new Date(1_800_000).toISOString()

  it('adds a flat candle at the price time after the last candle', () => {
    expect(withLatestPrice(CANDLES, 14, AT_1800)).toEqual([
      ...CANDLES,
      { time: 1800, open: 14, high: 14, low: 14, close: 14 },
    ])
  })

  it('closes the last candle at the price when the price is not newer', () => {
    expect(withLatestPrice(CANDLES, 8, new Date(900_000).toISOString())).toEqual([
      CANDLES[0],
      { time: 900, open: 11, high: 13, low: 8, close: 8 },
    ])
  })

  it('closes the last candle at the price without a price time', () => {
    expect(withLatestPrice(CANDLES, 14, null)).toEqual([
      CANDLES[0],
      { time: 900, open: 11, high: 14, low: 10, close: 14 },
    ])
  })

  it('keeps the candles without a price or candles', () => {
    expect(withLatestPrice(CANDLES, null, AT_1800)).toBe(CANDLES)
    expect(withLatestPrice([], 14, AT_1800)).toEqual([])
  })
})
