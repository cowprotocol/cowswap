/**
 * @jest-environment node
 */
import { getAsset, getMarketOverview, listAssets } from './assetsService'
import { coingeckoProvider } from './marketData'

import type { RwaToken } from '../model/types'

jest.mock('./marketData', () => ({
  coingeckoProvider: {
    getMarketData: jest.fn(),
    getChart: jest.fn(),
    getNetworkStats: jest.fn(),
    getHourlyDexVolume: jest.fn(),
    getPriceHistory: jest.fn(),
  },
}))

const getMarketDataMock = coingeckoProvider.getMarketData as jest.Mock
const getChartMock = coingeckoProvider.getChart as jest.Mock
const getNetworkStatsMock = coingeckoProvider.getNetworkStats as jest.Mock
const getHourlyDexVolumeMock = coingeckoProvider.getHourlyDexVolume as jest.Mock
const getPriceHistoryMock = coingeckoProvider.getPriceHistory as jest.Mock

const NVDA_MARKET = {
  price: 230,
  change24h: 2,
  dayLow: 225,
  dayHigh: 232,
  marketCap: 80_000_000,
  volume24h: 5_000_000,
  tokens: {},
  updatedAt: '2026-09-28T13:00:00.000Z',
}

describe('assetsService', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    getMarketDataMock.mockReset()
  })

  it('merges market data and marks the response as not degraded', async () => {
    getMarketDataMock.mockResolvedValue(new Map([['NVDA', NVDA_MARKET]]))

    const asset = await getAsset('nvda')

    expect(asset?.market).toEqual(NVDA_MARKET)
    expect(asset?.degraded).toBe(false)
  })

  it('marks the response as degraded when the provider fails', async () => {
    getMarketDataMock.mockRejectedValue(new Error('CoinGecko responded with 429'))

    const page = await listAssets({ page: 1, pageSize: 100, sort: 'priority', order: 'desc' })

    expect(page.degraded).toBe(true)
    expect(page.items.length).toBeGreaterThan(0)
    expect(page.items.every((item) => item.market === null)).toBe(true)
  })

  it('returns null for an unknown ticker', async () => {
    expect(await getAsset('UNKNOWN')).toBeNull()
  })
})

describe('getMarketOverview', () => {
  const NVDA_OVERVIEW_MARKET = {
    ...NVDA_MARKET,
    tokens: { 'nvidia-ondo-tokenized-stock': { price: 200, marketCap: null, volume24h: null, logoUrl: 'nvda.png' } },
  }
  const AAPL_MARKET = { ...NVDA_MARKET, change24h: -1, tokens: {}, updatedAt: '2026-09-28T13:05:00.000Z' }

  function volumeOf({ symbol }: RwaToken): number {
    if (symbol.startsWith('NVDA')) return 1000
    if (symbol.startsWith('SPY')) return 500

    return 0
  }

  function statsOf(_chainId: number, tokens: RwaToken[]): object[] {
    return tokens.map((token) => ({ address: token.address, onchainCap: 100, dexVolume24h: volumeOf(token) }))
  }

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    getMarketDataMock.mockResolvedValue(
      new Map([
        ['NVDA', NVDA_OVERVIEW_MARKET],
        ['AAPL', AAPL_MARKET],
      ]),
    )
    getNetworkStatsMock.mockImplementation(async (chainId: number, tokens: RwaToken[]) => statsOf(chainId, tokens))
    getHourlyDexVolumeMock.mockResolvedValue([{ time: 1, value: 1 }])
    getChartMock.mockResolvedValue([{ time: 1, value: 2 }])
    getPriceHistoryMock.mockResolvedValue(new Map([['nvidia-ondo-tokenized-stock', [{ time: 3600, value: 210 }]]]))
  })

  afterEach(() => {
    jest.restoreAllMocks()
    ;[getMarketDataMock, getChartMock, getNetworkStatsMock, getHourlyDexVolumeMock, getPriceHistoryMock].forEach(
      (mock) => mock.mockReset(),
    )
  })

  it('aggregates the whole registry', async () => {
    const overview = await getMarketOverview()

    expect(overview.degraded).toBe(false)
    expect(getNetworkStatsMock).toHaveBeenCalledTimes(3)
    expect(overview.totals.dexVolume24h).toBe(6000)
    expect(overview.totals.onchainCap).toBe(3100)
    expect(getPriceHistoryMock).toHaveBeenCalledWith(['nvidia-ondo-tokenized-stock'], '7')
    expect(overview.totals.onchainCapSeries).toEqual([{ time: 3600, value: 210 }])
    expect(overview.mostTraded.map(({ ticker }) => ticker)).toEqual(['NVDA', 'SPY'])
    expect(overview.mostTraded[0]).toMatchObject({
      logoUrl: 'nvda.png',
      dexVolume24h: 5000,
      series: [{ time: 1, value: 1 }],
    })
    expect(overview.gainers.map(({ ticker }) => ticker)).toEqual(['NVDA'])
    expect(overview.gainers[0]?.series).toEqual([{ time: 1, value: 2 }])
    expect(overview.losers.map(({ ticker }) => ticker)).toEqual(['AAPL'])
    expect(overview.updatedAt).toBe('2026-09-28T13:05:00.000Z')
    expect(overview.tradingTime).toEqual({ title: 'US market open', start: '13:30 UTC', end: '20:00 UTC' })
  })

  it('degrades and nulls the totals when one network fails', async () => {
    getNetworkStatsMock.mockRejectedValueOnce(new Error('GeckoTerminal responded with 429'))

    const overview = await getMarketOverview()

    expect(overview.degraded).toBe(true)
    expect(overview.totals).toEqual({ onchainCap: null, dexVolume24h: null, onchainCapSeries: null })
    expect(overview.mostTraded).toEqual([])
    expect(overview.gainers.map(({ ticker }) => ticker)).toEqual(['NVDA'])
  })

  it('degrades when market data fails', async () => {
    getMarketDataMock.mockRejectedValue(new Error('CoinGecko responded with 429'))

    const overview = await getMarketOverview()

    expect(overview.degraded).toBe(true)
    expect(overview.gainers).toEqual([])
    expect(overview.losers).toEqual([])
  })

  it('nulls only the failed series without degrading', async () => {
    getHourlyDexVolumeMock.mockRejectedValue(new Error('CoinGecko responded with 500'))
    getChartMock.mockResolvedValue([])

    const overview = await getMarketOverview()

    expect(overview.degraded).toBe(false)
    expect(overview.mostTraded.every(({ series }) => series === null)).toBe(true)
    expect(overview.gainers[0]?.series).toBeNull()
    expect(overview.totals.onchainCapSeries).not.toBeNull()
  })
})
