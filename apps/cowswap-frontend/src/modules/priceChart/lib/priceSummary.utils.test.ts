import { getPriceChartSummary } from './priceSummary.utils'

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
