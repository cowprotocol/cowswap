import { getTimeRangeConfig, getCandlePriceFormat } from './simplePriceChart.utils'

const NOW = 1_800_000_000

describe('getTimeRangeConfig', () => {
  it.each([
    ['1H', NOW - 60 * 60, '1m'],
    ['1D', NOW - 24 * 60 * 60, '5m'],
    ['1W', NOW - 7 * 24 * 60 * 60, '15m'],
    ['1M', NOW - 30 * 24 * 60 * 60, '1h'],
    ['1Y', NOW - 365 * 24 * 60 * 60, '1d'],
    ['All', 0, '7d'],
  ] as const)('maps %s to its request range and interval', (period, from, interval) => {
    expect(getTimeRangeConfig(period, NOW)).toEqual({ from, interval, to: NOW })
  })
})

describe('getCandlePriceFormat', () => {
  it.each([
    [0.109, 4, 0.0001],
    [0.00001456, 8, 0.00000001],
    [1_916, 2, 0.01],
  ])('uses enough precision for %s', (price, precision, minMove) => {
    const bar = { close: price, high: price, low: price, open: price, timestamp: 1 }

    expect(getCandlePriceFormat([bar])).toEqual({ minMove, precision, type: 'price' })
  })
})
