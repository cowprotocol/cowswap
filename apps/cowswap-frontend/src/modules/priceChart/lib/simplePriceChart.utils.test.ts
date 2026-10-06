import { getSimplePriceChartPeriodConfig, getSimplePriceChartPriceFormat } from './simplePriceChart.utils'

const NOW = 1_800_000_000

describe('getSimplePriceChartPeriodConfig', () => {
  it.each([
    ['1H', NOW - 60 * 60, '1'],
    ['1D', NOW - 24 * 60 * 60, '5'],
    ['1W', NOW - 7 * 24 * 60 * 60, '15'],
    ['1M', NOW - 30 * 24 * 60 * 60, '60'],
    ['1Y', NOW - 365 * 24 * 60 * 60, '1D'],
    ['All', 0, '7D'],
  ] as const)('maps %s to its request range and resolution', (period, from, resolution) => {
    expect(getSimplePriceChartPeriodConfig(period, NOW)).toEqual({ from, resolution, to: NOW })
  })
})

describe('getSimplePriceChartPriceFormat', () => {
  it.each([
    [0.109, 4, 0.0001],
    [0.00001456, 8, 0.00000001],
    [1_916, 2, 0.01],
  ])('uses enough precision for %s', (price, precision, minMove) => {
    const bar = { close: price, high: price, low: price, open: price, timestamp: 1 }

    expect(getSimplePriceChartPriceFormat([bar])).toEqual({ minMove, precision, type: 'price' })
  })
})
