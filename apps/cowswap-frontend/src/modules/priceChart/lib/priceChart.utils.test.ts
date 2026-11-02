import { formatPriceChartValue, getPriceChartPriceFormat, getPriceChartSummary } from './priceChart.utils'

import type { Candle } from './priceChart.types'

describe('price chart formatting', () => {
  it('keeps significant digits for small prices', () => {
    expect(formatPriceChartValue(0.10943, 'en-US')).toBe('$0.1094')
    expect(formatPriceChartValue(-0.10943, 'en-US')).toBe('-$0.1094')
    expect(formatPriceChartValue(0.000001234, 'en-US')).toBe('$0.000001234')
  })

  it('formats regular and large prices', () => {
    expect(formatPriceChartValue(1916.418, 'en-US')).toBe('$1,916.42')
    expect(formatPriceChartValue(1_234_567, 'en-US')).toBe('$1.23M')
  })

  it('formats any large value consistently', () => {
    expect(formatPriceChartValue(109_430_000, 'en-US')).toBe('$109.43M')
  })

  // Without an explicit precision a stablecoin reads the same on every gridline, because the branch is
  // picked by magnitude: 0.99985 gets four significant digits, 1.00012 gets two decimals.
  it('formats both sides of $1 alike once the series precision is known', () => {
    expect(formatPriceChartValue(0.99985, 'en-US')).toBe('$0.9999')
    expect(formatPriceChartValue(1.00012, 'en-US')).toBe('$1.00')

    expect(formatPriceChartValue(0.99985, 'en-US', 4)).toBe('$0.9999')
    expect(formatPriceChartValue(1.00012, 'en-US', 4)).toBe('$1.0001')
  })

  it('keeps compact notation for large values', () => {
    expect(formatPriceChartValue(71_520_071_848, 'en-US', 2)).toBe('$71.52B')
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

describe('getPriceChartPriceFormat', () => {
  it.each([
    [0.109, 4, 0.0001],
    [0.00001456, 8, 0.00000001],
    [1_916, 2, 0.01],
  ])('uses enough precision for %s', (price, precision, minMove) => {
    const bar = { close: price, high: price, low: price, open: price, timestamp: 1 }

    expect(getPriceChartPriceFormat([bar])).toEqual({ minMove, precision, type: 'price' })
  })

  const series = (prices: number[]): Candle[] =>
    prices.map((price, index) => ({ close: price, high: price, low: price, open: price, timestamp: index }))

  // A series that moves by far less than it is worth needs decimals its magnitude never asks for.
  it.each([
    ['a stablecoin straddling $1', [0.99971, 0.99985, 1.00012, 1.00031], 4],
    ['a stablecoin entirely above $1', [1.00001, 1.00022, 1.00051], 4],
    ['a volatile token', [2250, 2271, 2290], 2],
    ['a market cap in billions', [71_500_000_000, 71_520_071_848, 71_550_000_000], 2],
  ])('uses the spread, not the magnitude, for %s', (_, prices, precision) => {
    expect(getPriceChartPriceFormat(series(prices))).toEqual({ minMove: 1 / 10 ** precision, precision, type: 'price' })
  })
})
