import { formatPriceChartAxisValue, formatPriceChartValue, getPriceChartSummary } from './priceSummary.utils'

describe('price chart formatting', () => {
  it('keeps significant digits for small prices', () => {
    expect(formatPriceChartValue(0.10943, 'en-US')).toBe('$0.1094')
    expect(formatPriceChartValue(0.000001234, 'en-US')).toBe('$0.000001234')
  })

  it('formats regular and large prices', () => {
    expect(formatPriceChartValue(1916.418, 'en-US')).toBe('$1,916.42')
    expect(formatPriceChartValue(1_234_567, 'en-US')).toBe('$1.23M')
  })

  it('formats any large value consistently', () => {
    expect(formatPriceChartValue(109_430_000, 'en-US')).toBe('$109.43M')
  })

  it('snaps floating-point zero residue to zero at the chart tick size', () => {
    expect(formatPriceChartAxisValue(2.776e-17, 'en-US', 0.0001)).toBe('$0.00')
    expect(formatPriceChartAxisValue(0.00006, 'en-US', 0.0001)).toBe('$0.00006')
  })
})

describe('getPriceChartSummary', () => {
  it('returns the latest price and change across the loaded period', () => {
    expect(
      getPriceChartSummary([
        { close: 110, high: 115, low: 95, open: 100, timestamp: 1 },
        { close: 120, high: 125, low: 105, open: 110, timestamp: 2 },
      ]),
    ).toEqual({ change: 0.2, price: 120 })
  })

  it('returns undefined without usable bars', () => {
    expect(getPriceChartSummary([])).toBeUndefined()
    expect(getPriceChartSummary([{ close: 1, high: 1, low: 0, open: 0, timestamp: 1 }])).toBeUndefined()
  })
})
