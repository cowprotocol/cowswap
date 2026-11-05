/**
 * @jest-environment node
 */
import { ondoStockDataProvider } from './ondoStockData'

import type { RwaAsset, RwaToken } from '../model/types'

import { fetchOndoUnderlyingCandles, fetchOndoUnderlyingMarket, type OndoCandle } from '@/shared/api/index.server'

jest.mock('@/shared/api/index.server', () => ({
  fetchOndoUnderlyingCandles: jest.fn(),
  fetchOndoUnderlyingMarket: jest.fn(),
}))

jest.mock('./marketData', () => ({
  CHART_REVALIDATE_SECONDS: { '1D': 900, '1W': 1800, '1M': 3600, '1Y': 3600, ALL: 3600 },
}))

const NOW_MS = Date.parse('2026-11-05T15:00:00Z')
const HOUR_MS = 3600_000

const NVDAX: RwaToken = { chainId: 1, address: '0x1', symbol: 'NVDAx', name: 'NVDAx', decimals: 18, issuer: 'xStocks' }
const NVDAON: RwaToken = { chainId: 1, address: '0x2', symbol: 'NVDAon', name: 'NVDAon', decimals: 18, issuer: 'Ondo' }

const ASSET: RwaAsset = {
  ticker: 'NVDA',
  coingeckoId: 'nvidia',
  title: 'NVIDIA',
  type: 'stock',
  priority: 0,
  tokens: [NVDAX, NVDAON],
}

const fetchCandlesMock = fetchOndoUnderlyingCandles as jest.Mock
const fetchMarketMock = fetchOndoUnderlyingMarket as jest.Mock

function candle(timestamp: number, open: number, high: number, low: number, close: number): OndoCandle {
  return { timestamp, open: String(open), high: String(high), low: String(low), close: String(close) }
}

beforeEach(() => {
  jest.resetAllMocks()
  jest.spyOn(Date, 'now').mockReturnValue(NOW_MS)
  fetchMarketMock.mockResolvedValue({
    underlyingMarket: {
      ticker: 'NVDA',
      price: '210',
      priceHigh52w: '243.37',
      priceLow52w: '164.27',
      volume: '149033316.518682',
      marketCap: '4832834234634',
    },
    timestamp: NOW_MS,
  })
  fetchCandlesMock.mockResolvedValue([
    candle(NOW_MS - 24 * HOUR_MS, 200, 205, 198, 204),
    candle(NOW_MS - 12 * HOUR_MS, 204, 212, 203, 209),
  ])
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('ondoStockDataProvider.getMarket', () => {
  it('looks the stock up by the Ondo token and derives the 24h stats from its 15 min candles', async () => {
    expect(await ondoStockDataProvider.getMarket(ASSET)).toEqual({
      market: {
        price: 210,
        change24h: 5,
        dayLow: 198,
        dayHigh: 212,
        yearLow: 164.27,
        yearHigh: 243.37,
        marketCap: 4832834234634,
        volume24h: 149033316.518682 * 210,
        updatedAt: '2026-11-05T15:00:00.000Z',
        provider: 'Ondo',
      },
      degraded: false,
    })
    expect(fetchMarketMock).toHaveBeenCalledWith('NVDAon', 60)
    expect(fetchCandlesMock).toHaveBeenCalledWith('NVDAon', '15min/1day', 60)
  })

  it('keeps the price without candles', async () => {
    fetchCandlesMock.mockResolvedValue(null)

    expect(await ondoStockDataProvider.getMarket(ASSET)).toMatchObject({
      market: { price: 210, change24h: null, dayLow: null, dayHigh: null },
      degraded: false,
    })
  })

  it('keeps the price when the candles fail, as degraded', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    fetchCandlesMock.mockRejectedValue(new Error('Ondo responded with 429'))

    expect(await ondoStockDataProvider.getMarket(ASSET)).toMatchObject({
      market: { price: 210, change24h: null, dayLow: null, dayHigh: null },
      degraded: true,
    })
  })

  it('is null for an asset without an Ondo token, without a request', async () => {
    expect(await ondoStockDataProvider.getMarket({ ...ASSET, tokens: [NVDAX] })).toBeNull()
    expect(fetchMarketMock).not.toHaveBeenCalled()
  })

  it('is null when Ondo does not list the token or has no price', async () => {
    fetchMarketMock.mockResolvedValueOnce(null)
    expect(await ondoStockDataProvider.getMarket(ASSET)).toBeNull()

    fetchMarketMock.mockResolvedValueOnce({ underlyingMarket: { ticker: 'NVDA', price: '' }, timestamp: NOW_MS })
    expect(await ondoStockDataProvider.getMarket(ASSET)).toBeNull()
  })
})

describe('ondoStockDataProvider.getChart', () => {
  it('skips candles with a non-positive price', async () => {
    fetchCandlesMock.mockResolvedValue([
      candle(NOW_MS - 2 * HOUR_MS, 200, 205, 198, 0),
      candle(NOW_MS - HOUR_MS, 0, 205, 198, 204),
      candle(NOW_MS - 30 * 60_000, 204, 206, 203, 205),
    ])

    expect(await ondoStockDataProvider.getChart(ASSET, '1D')).toEqual([
      { time: (NOW_MS - 30 * 60_000) / 1000 + 900, value: 205 },
    ])
  })

  it('places each close at the end of its candle, and the open last candle at now', async () => {
    expect(await ondoStockDataProvider.getChart(ASSET, '1D')).toEqual([
      { time: (NOW_MS - 24 * HOUR_MS) / 1000 + 900, value: 204 },
      { time: (NOW_MS - 12 * HOUR_MS) / 1000 + 900, value: 209 },
    ])

    fetchCandlesMock.mockResolvedValue([candle(NOW_MS - 60_000, 200, 201, 199, 200.5)])

    expect(await ondoStockDataProvider.getChart(ASSET, '1D')).toEqual([{ time: NOW_MS / 1000, value: 200.5 }])
  })

  it('cuts 1W from the hourly month', async () => {
    fetchCandlesMock.mockResolvedValue([
      candle(NOW_MS - 10 * 24 * HOUR_MS, 1, 1, 1, 1),
      candle(NOW_MS - 7 * 24 * HOUR_MS, 2, 2, 2, 2),
      candle(NOW_MS - HOUR_MS, 3, 3, 3, 3),
    ])

    const candles = await ondoStockDataProvider.getCandles(ASSET, '1W')

    expect(fetchCandlesMock).toHaveBeenCalledWith('NVDAon', '1hour/1month', 1800)
    expect(candles?.map(({ close }) => close)).toEqual([2, 3])
  })

  it('is null without candles, so the next provider is asked', async () => {
    fetchCandlesMock.mockResolvedValue([])

    expect(await ondoStockDataProvider.getChart(ASSET, '1Y')).toBeNull()
  })
})
