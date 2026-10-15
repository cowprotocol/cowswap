import {
  buildDailySeries,
  buildMarketCapSeries,
  fillHourlySeries,
  latestUpdatedAt,
  rankMostTraded,
  splitMovers,
  toOverviewItem,
} from './marketOverview'

import type { RwaAggregateMarket, RwaAsset, RwaMarketData, RwaMarketOverviewItem, RwaToken } from './types'

const HOUR = 3600

function asset(ticker: string, tokens: RwaToken[], logoUrl?: string): RwaAsset {
  return { ticker, coingeckoId: ticker.toLowerCase(), title: ticker, logoUrl, type: 'stock', priority: 0, tokens }
}

function item(ticker: string, change24h: number | null, volume24h: number | null): RwaMarketOverviewItem {
  return { ticker, title: ticker, logoUrl: null, change24h, volume24h, series: null }
}

function market(overrides: Partial<RwaMarketData>): RwaMarketData {
  return {
    price: null,
    change24h: null,
    dayLow: null,
    dayHigh: null,
    marketCap: null,
    volume24h: null,
    tokens: {},
    updatedAt: null,
    ...overrides,
  }
}

describe('toOverviewItem', () => {
  it('takes the logo of the asset and the change and volume of the RWA market', () => {
    expect(toOverviewItem(asset('NVDA', [], 'nvda.png'), aggregate({ change24h: 1.5, volume24h: 7 }))).toEqual({
      ticker: 'NVDA',
      title: 'NVDA',
      logoUrl: 'nvda.png',
      change24h: 1.5,
      volume24h: 7,
      series: null,
    })
  })

  it('has a null logo for an asset without one', () => {
    expect(toOverviewItem(asset('NVDA', []), aggregate({})).logoUrl).toBeNull()
  })
})

describe('rankMostTraded', () => {
  it('sorts by volume desc, breaks ties by ticker and drops zero and null volume', () => {
    const ranked = rankMostTraded(
      [item('C', 0, 5), item('A', 0, 5), item('B', 0, 9), item('Z', 0, 0), item('N', 0, null), item('D', 0, 1)],
      3,
    )

    expect(ranked.map(({ ticker }) => ticker)).toEqual(['B', 'A', 'C'])
  })
})

describe('splitMovers', () => {
  it('uses the strict sign and sorts by magnitude', () => {
    const { gainers, losers } = splitMovers(
      [
        item('A', 1, null),
        item('B', 3, null),
        item('C', 0, null),
        item('D', -2, null),
        item('E', null, null),
        item('F', -0.5, null),
        item('G', 3, null),
      ],
      3,
    )

    expect(gainers.map(({ ticker }) => ticker)).toEqual(['B', 'G', 'A'])
    expect(losers.map(({ ticker }) => ticker)).toEqual(['D', 'F'])
  })

  it('returns empty lists when nothing moved', () => {
    expect(splitMovers([item('A', 0, null), item('B', null, null)], 3)).toEqual({ gainers: [], losers: [] })
  })
})

describe('fillHourlySeries', () => {
  const now = 100 * HOUR + 1800

  it('returns a fixed window ending at the current hour and fills missing hours with 0', () => {
    const series = fillHourlySeries(
      [
        { time: 100 * HOUR + 10, value: 4 },
        { time: 100 * HOUR + 20, value: 6 },
        { time: 98 * HOUR, value: 1 },
        { time: 90 * HOUR, value: 99 },
      ],
      now,
      3,
    )

    expect(series).toEqual([
      { time: 98 * HOUR, value: 1 },
      { time: 99 * HOUR, value: 0 },
      { time: 100 * HOUR, value: 10 },
    ])
  })
})

describe('latestUpdatedAt', () => {
  it('picks the latest timestamp and ignores nulls', () => {
    expect(
      latestUpdatedAt([
        market({ updatedAt: '2026-09-28T13:00:00.000Z' }),
        market({ updatedAt: null }),
        market({ updatedAt: '2026-09-28T13:05:00.000Z' }),
      ]),
    ).toBe('2026-09-28T13:05:00.000Z')
    expect(latestUpdatedAt([])).toBeNull()
  })
})

function aggregate(overrides: Partial<RwaAggregateMarket>): RwaAggregateMarket {
  return {
    price: null,
    change24h: null,
    dayLow: null,
    dayHigh: null,
    marketCap: null,
    volume24h: null,
    updatedAt: null,
    sparkline7d: [],
    ...overrides,
  }
}

describe('buildMarketCapSeries', () => {
  it('sums end-aligned sparklines of different lengths at constant supply', () => {
    const series = buildMarketCapSeries([
      // supply 10, 3 hours ending at 13:00
      aggregate({ price: 10, marketCap: 100, sparkline7d: [9, 10, 11], updatedAt: '2026-10-02T13:20:00.000Z' }),
      // supply 5, 1 hour ending at 13:00
      aggregate({ price: 2, marketCap: 10, sparkline7d: [4], updatedAt: '2026-10-02T13:05:00.000Z' }),
    ])
    const at = (iso: string): number => Date.parse(iso) / 1000

    expect(series).toEqual([
      { time: at('2026-10-02T11:00:00.000Z'), value: 90 },
      { time: at('2026-10-02T12:00:00.000Z'), value: 100 },
      { time: at('2026-10-02T13:00:00.000Z'), value: 130 },
    ])
  })

  it('aligns every sparkline to the latest update hour', () => {
    const series = buildMarketCapSeries([
      aggregate({ price: 1, marketCap: 1, sparkline7d: [1, 2], updatedAt: '2026-10-02T13:59:00.000Z' }),
      aggregate({ price: 1, marketCap: 10, sparkline7d: [1, 2], updatedAt: '2026-10-02T14:01:00.000Z' }),
    ])
    const at = (iso: string): number => Date.parse(iso) / 1000

    expect(series).toEqual([
      { time: at('2026-10-02T13:00:00.000Z'), value: 11 },
      { time: at('2026-10-02T14:00:00.000Z'), value: 22 },
    ])
  })

  it('never adds NaN from a sparkline point or a market cap', () => {
    const series = buildMarketCapSeries([
      aggregate({ price: 1, marketCap: 2, sparkline7d: [1, NaN, 3], updatedAt: '2026-10-02T13:00:00.000Z' }),
      aggregate({ price: 1, marketCap: NaN, sparkline7d: [5, 5, 5], updatedAt: '2026-10-02T13:00:00.000Z' }),
    ])

    expect(series?.map(({ value }) => value)).toEqual([2, 6])
  })

  it('skips markets without a price, market cap, sparkline or update time', () => {
    const series = buildMarketCapSeries([
      aggregate({ price: 0, marketCap: 100, sparkline7d: [1], updatedAt: '2026-10-02T13:00:00.000Z' }),
      aggregate({ price: 1, marketCap: null, sparkline7d: [1], updatedAt: '2026-10-02T13:00:00.000Z' }),
      aggregate({ price: 1, marketCap: 100, sparkline7d: [], updatedAt: '2026-10-02T13:00:00.000Z' }),
      aggregate({ price: 1, marketCap: 100, sparkline7d: [1], updatedAt: null }),
    ])

    expect(series).toBeNull()
  })
})

describe('buildDailySeries', () => {
  it('takes the last 24 hours of the sparkline, ending at the update hour', () => {
    const sparkline7d = Array.from({ length: 30 }, (_, index) => index)
    const series = buildDailySeries(aggregate({ sparkline7d, updatedAt: '2026-10-02T13:20:00.000Z' }))
    const lastHour = Date.parse('2026-10-02T13:00:00.000Z') / 1000

    expect(series).toHaveLength(25)
    expect(series?.[0]).toEqual({ time: lastHour - 24 * HOUR, value: 5 })
    expect(series?.[24]).toEqual({ time: lastHour, value: 29 })
  })

  it('keeps a shorter sparkline whole and drops non-finite points', () => {
    const series = buildDailySeries(aggregate({ sparkline7d: [1, NaN, 3], updatedAt: '2026-10-02T13:00:00.000Z' }))
    const lastHour = Date.parse('2026-10-02T13:00:00.000Z') / 1000

    expect(series).toEqual([
      { time: lastHour - 2 * HOUR, value: 1 },
      { time: lastHour, value: 3 },
    ])
  })

  it('returns null without points or an update time', () => {
    expect(buildDailySeries(aggregate({ sparkline7d: [], updatedAt: '2026-10-02T13:00:00.000Z' }))).toBeNull()
    expect(buildDailySeries(aggregate({ sparkline7d: [NaN], updatedAt: '2026-10-02T13:00:00.000Z' }))).toBeNull()
    expect(buildDailySeries(aggregate({ sparkline7d: [1, 2], updatedAt: null }))).toBeNull()
  })
})
