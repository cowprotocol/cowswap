import {
  aggregateNetworkStats,
  buildOnchainCapSeries,
  fillHourlySeries,
  latestUpdatedAt,
  rankMostTraded,
  splitMovers,
  toOverviewItem,
} from './marketOverview'

import type { RwaAsset, RwaMarketData, RwaMarketOverviewItem, RwaToken } from './types'

const HOUR = 3600

function asset(ticker: string, tokens: RwaToken[]): RwaAsset {
  return { ticker, title: ticker, type: 'stock', priority: 0, tokens }
}

function item(ticker: string, change24h: number | null, dexVolume24h: number | null): RwaMarketOverviewItem {
  return { ticker, title: ticker, logoUrl: null, change24h, dexVolume24h, series: null }
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

function token(chainId: number, address: string, coingeckoId?: string): RwaToken {
  return { chainId, address, symbol: 'T', name: 'Token', decimals: 18, issuer: 'Ondo', coingeckoId }
}

const A1 = '0x1111111111111111111111111111111111111111'
const A56 = '0x2222222222222222222222222222222222222222'
const B1 = '0x3333333333333333333333333333333333333333'

describe('aggregateNetworkStats', () => {
  const assets = [asset('A', [token(1, A1, 'a-coin'), token(56, A56, 'a-coin')]), asset('B', [token(1, B1, 'b-coin')])]
  const marketByTicker = new Map([
    ['A', market({ tokens: { 'a-coin': { price: 50, marketCap: null, volume24h: null, logoUrl: null } } })],
  ])

  it('sums per asset and in total, skipping null parts', () => {
    const result = aggregateNetworkStats(
      assets,
      [
        { chainId: 1, tokens: [{ address: A1.toUpperCase().replace('0X', '0x'), onchainCap: 100, dexVolume24h: 10 }] },
        { chainId: 56, tokens: [{ address: A56, onchainCap: null, dexVolume24h: null }] },
      ],
      marketByTicker,
    )

    expect(result.byTicker.get('A')).toEqual({ onchainCap: 100, dexVolume24h: 10 })
    expect(result.byTicker.get('B')).toEqual({ onchainCap: null, dexVolume24h: null })
    expect(result.onchainCap).toBe(100)
    expect(result.dexVolume24h).toBe(10)
  })

  it('derives the onchain supply per coin from cap and price', () => {
    const result = aggregateNetworkStats(
      assets,
      [
        { chainId: 1, tokens: [{ address: A1, onchainCap: 100, dexVolume24h: 0 }] },
        { chainId: 56, tokens: [{ address: A56, onchainCap: 50, dexVolume24h: 0 }] },
      ],
      marketByTicker,
    )

    expect(result.supplyByCoin).toEqual(new Map([['a-coin', 3]]))
  })
})

describe('toOverviewItem', () => {
  it('takes the logo of the reference token and the asset DEX volume', () => {
    const nvda = asset('NVDA', [token(1, A1), token(1, A56, 'ref-coin')])
    const nvdaMarket = market({
      change24h: 1.5,
      tokens: { 'ref-coin': { price: 1, marketCap: null, volume24h: null, logoUrl: 'ref.png' } },
    })

    expect(toOverviewItem(nvda, nvdaMarket, { onchainCap: 1, dexVolume24h: 7 })).toEqual({
      ticker: 'NVDA',
      title: 'NVDA',
      logoUrl: 'ref.png',
      change24h: 1.5,
      dexVolume24h: 7,
      series: null,
    })
    expect(toOverviewItem(nvda, undefined, undefined)).toMatchObject({
      logoUrl: null,
      change24h: null,
      dexVolume24h: null,
    })
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

describe('buildOnchainCapSeries', () => {
  it('aligns coins on one hourly grid, carries prices forward and backfills late starts', () => {
    const series = buildOnchainCapSeries(
      new Map([
        ['a', 2],
        ['b', 1],
        ['no-history', 1000],
      ]),
      new Map([
        [
          'a',
          [
            { time: 10 * HOUR + 5, value: 100 },
            { time: 11 * HOUR + 10, value: 110 },
          ],
        ],
        ['b', [{ time: 11 * HOUR + 20, value: 50 }]],
        ['no-history', []],
      ]),
    )

    expect(series).toEqual([
      { time: 10 * HOUR, value: 250 },
      { time: 11 * HOUR, value: 270 },
    ])
  })

  it('returns null when no coin has history', () => {
    expect(buildOnchainCapSeries(new Map([['a', 1]]), new Map())).toBeNull()
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
