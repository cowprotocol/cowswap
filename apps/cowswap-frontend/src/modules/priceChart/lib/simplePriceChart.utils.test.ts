import { getSimplePriceChartPeriodConfig } from './simplePriceChart.utils'

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
