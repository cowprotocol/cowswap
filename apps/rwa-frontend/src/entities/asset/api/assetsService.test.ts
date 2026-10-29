/**
 * @jest-environment node
 */
import {
  findAssets,
  getAsset,
  getAssetCandles,
  getAssetChart,
  getAssetNetworkStats,
  getMarketOverview,
  listAssets,
} from './assetsService'
import { coingeckoProvider } from './marketData'
import { loadSharesPerToken, loadTradingPause } from './sharesMultipliers'

import { getAssetByTicker } from '../model/registry'

import type { RwaAggregateMarket, RwaAsset } from '../model/types'

jest.mock('./marketData', () => ({
  coingeckoProvider: {
    getRwaMarkets: jest.fn(),
    getTokenMarkets: jest.fn(),
    getChart: jest.fn(),
    getCandles: jest.fn(),
    getNetworkStats: jest.fn(),
    getHourlyDexVolume: jest.fn(),
  },
}))

jest.mock('./sharesMultipliers', () => ({
  loadSharesPerToken: jest.fn(),
  loadTradingPause: jest.fn(),
}))

jest.mock('../model/registry', () => {
  const tradingTime = { title: 'US market open', start: '13:30 UTC', end: '20:00 UTC' }
  const token = (symbol: string, chainId: number, address: string, issuer: string, coingeckoId: string): object => ({
    chainId,
    address,
    symbol,
    name: symbol,
    decimals: 18,
    issuer,
    coingeckoId,
  })
  const assets = [
    {
      ticker: 'AAPL',
      coingeckoId: 'apple',
      title: 'Apple',
      logoUrl: 'https://example.com/aapl.png',
      type: 'stock',
      priority: 10,
      allowedTradingTime: tradingTime,
      tokens: [token('AAPLx', 1, '0x0000000000000000000000000000000000000001', 'xStocks', 'apple-xstock')],
    },
    {
      ticker: 'NVDA',
      coingeckoId: 'nvidia',
      title: 'NVIDIA',
      logoUrl: 'https://example.com/nvda.png',
      type: 'stock',
      priority: 9,
      tokens: [
        token('NVDAon', 1, '0x0000000000000000000000000000000000000002', 'Ondo', 'nvidia-ondo-tokenized-stock'),
        token('NVDAx', 56, '0x0000000000000000000000000000000000000003', 'xStocks', 'nvidia-xstock'),
      ],
    },
    {
      ticker: 'SPY',
      coingeckoId: 'spdr-s-p-500-etf-trust',
      title: 'SPDR S&P 500 ETF',
      type: 'index',
      priority: 8,
      tokens: [token('SPYon', 1, '0x0000000000000000000000000000000000000004', 'Ondo', 'spy-ondo')],
    },
  ]

  return {
    getAssets: () => assets,
    getAssetByTicker: (ticker: string) => assets.find((asset) => asset.ticker === ticker.toUpperCase()),
  }
})

const getRwaMarketsMock = coingeckoProvider.getRwaMarkets as jest.Mock
const getTokenMarketsMock = coingeckoProvider.getTokenMarkets as jest.Mock
const getChartMock = coingeckoProvider.getChart as jest.Mock
const getCandlesMock = coingeckoProvider.getCandles as jest.Mock
const getNetworkStatsMock = coingeckoProvider.getNetworkStats as jest.Mock
const getHourlyDexVolumeMock = coingeckoProvider.getHourlyDexVolume as jest.Mock
const loadSharesPerTokenMock = loadSharesPerToken as jest.Mock
const loadTradingPauseMock = loadTradingPause as jest.Mock
const ALL_MOCKS = [
  getRwaMarketsMock,
  getTokenMarketsMock,
  getChartMock,
  getCandlesMock,
  getNetworkStatsMock,
  getHourlyDexVolumeMock,
  loadSharesPerTokenMock,
  loadTradingPauseMock,
]

const NVDAON_KEY = '1:0x0000000000000000000000000000000000000002'
const NVDAX_KEY = '56:0x0000000000000000000000000000000000000003'
const AAPLX_KEY = '1:0x0000000000000000000000000000000000000001'
const SHARES_PER_TOKEN = { [AAPLX_KEY]: 1, [NVDAON_KEY]: 1.0017, [NVDAX_KEY]: 1 }
const XSTOCKS_PAUSE = { issuer: 'xStocks', start: '2026-10-28T00:15:00.000Z', end: '2026-10-28T00:45:00.000Z' }

const NVDA_SPARKLINE = [...Array.from({ length: 7 * 24 }, () => 170), 180]

const NVDA_MARKET: RwaAggregateMarket = {
  price: 180,
  change24h: 2,
  dayLow: 175,
  dayHigh: 182,
  marketCap: 1000,
  volume24h: 500,
  updatedAt: '2026-10-02T13:00:00.000Z',
  sparkline7d: NVDA_SPARKLINE,
}

const AAPL_MARKET: RwaAggregateMarket = {
  ...NVDA_MARKET,
  price: 250,
  change24h: -1,
  marketCap: 3000,
  volume24h: 100,
  updatedAt: '2026-10-02T13:05:00.000Z',
  sparkline7d: [250],
}

const NVDA_TOKEN_MARKETS = {
  'nvidia-ondo-tokenized-stock': { price: 181, marketCap: 600, volume24h: 300, logoUrl: 'nvdaon.png' },
}

function nvda(): RwaAsset {
  const asset = getAssetByTicker('NVDA')

  if (!asset) throw new Error('NVDA fixture is missing')

  return asset
}

const NVDA_DAILY_SERIES = NVDA_SPARKLINE.slice(-24).map((value, index) => ({
  time: Date.parse('2026-10-02T13:00:00.000Z') / 1000 - (23 - index) * 3600,
  value,
}))

function tickers(items: { ticker: string }[]): string[] {
  return items.map(({ ticker }) => ticker)
}

beforeEach(() => {
  ALL_MOCKS.forEach((mock) => mock.mockReset())
  jest.spyOn(console, 'error').mockImplementation(() => undefined)
  getRwaMarketsMock.mockResolvedValue(
    new Map([
      ['nvidia', NVDA_MARKET],
      ['apple', AAPL_MARKET],
    ]),
  )
  getTokenMarketsMock.mockResolvedValue(NVDA_TOKEN_MARKETS)
  getHourlyDexVolumeMock.mockResolvedValue([{ time: 1, value: 1 }])
  loadSharesPerTokenMock.mockResolvedValue({ byKey: SHARES_PER_TOKEN, degraded: false })
  loadTradingPauseMock.mockResolvedValue(null)
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('listAssets', () => {
  it('sorts by the RWA markets volume and takes the series from the RWA markets sparkline', async () => {
    const page = await listAssets({ page: 1, pageSize: 2, sort: 'volume24h', order: 'desc' })

    expect(page.degraded).toBe(false)
    expect(page.total).toBe(3)
    expect(tickers(page.items)).toEqual(['NVDA', 'AAPL'])
    expect(page.items[0]).toMatchObject({
      logoUrl: 'https://example.com/nvda.png',
      market: { price: 180, volume24h: 500, marketCap: 1000, tokens: {} },
      series: NVDA_DAILY_SERIES,
    })
    expect(page.items[0]?.market).not.toHaveProperty('sparkline7d')
    expect(page.items[0]?.market).not.toHaveProperty('logoUrl')
    expect(getChartMock).not.toHaveBeenCalled()
    expect(getRwaMarketsMock).toHaveBeenCalledWith(3)
    expect(getTokenMarketsMock).not.toHaveBeenCalled()
    expect(getNetworkStatsMock).not.toHaveBeenCalled()
  })

  it('sorts by market cap and puts assets without market data last', async () => {
    const page = await listAssets({ page: 1, pageSize: 10, sort: 'marketCap', order: 'desc' })

    expect(tickers(page.items)).toEqual(['AAPL', 'NVDA', 'SPY'])
    expect(page.items[2]).toMatchObject({ market: null, series: null })
    expect(page.items[2]).not.toHaveProperty('logoUrl')
  })

  it('sorts by the 24h change of the RWA markets sparkline, not of a bad RWA markets tick', async () => {
    getRwaMarketsMock.mockResolvedValue(
      new Map([
        ['nvidia', { ...NVDA_MARKET, change24h: -70 }],
        ['apple', AAPL_MARKET],
      ]),
    )

    const page = await listAssets({ page: 1, pageSize: 10, sort: 'change24h', order: 'desc' })

    expect(tickers(page.items)).toEqual(['NVDA', 'AAPL', 'SPY'])
    expect(page.items[0]?.market?.change24h).toBeCloseTo(((180 - 170) / 170) * 100)
  })

  it('filters and counts the types with the other filters applied', async () => {
    const page = await listAssets({ page: 1, pageSize: 10, sort: 'priority', order: 'desc', type: 'index' })

    expect(tickers(page.items)).toEqual(['SPY'])
    expect(page.typeCounts).toEqual({ stock: 2, index: 1, commodity: 0 })
    expect(page.issuers).toEqual(['Ondo', 'xStocks'])
    expect(page.chainIds).toEqual([1, 56])
  })

  it('degrades with null market data when the RWA markets fail', async () => {
    getRwaMarketsMock.mockRejectedValue(new Error('CoinGecko responded with 429'))

    const page = await listAssets({ page: 1, pageSize: 10, sort: 'volume24h', order: 'desc' })

    expect(page.degraded).toBe(true)
    expect(tickers(page.items)).toEqual(['AAPL', 'NVDA', 'SPY'])
    expect(page.items.every((item) => item.market === null)).toBe(true)
  })

  it('fills the token markets of the matched assets when filtered by tickers', async () => {
    const page = await listAssets({ page: 1, pageSize: 10, sort: 'ticker', order: 'asc', tickers: ['NVDA'] })

    expect(getTokenMarketsMock).toHaveBeenCalledWith(nvda().tokens)
    expect(page.items[0]?.market?.tokens).toEqual(NVDA_TOKEN_MARKETS)
    expect(page.degraded).toBe(false)
  })

  it('gives every asset the shares per token of its own tokens when filtered by tickers', async () => {
    const page = await listAssets({ page: 1, pageSize: 10, sort: 'ticker', order: 'asc', tickers: ['AAPL', 'NVDA'] })

    expect(page.items.map((item) => item.market?.sharesPerToken)).toEqual([
      { [AAPLX_KEY]: 1 },
      { [NVDAON_KEY]: 1.0017, [NVDAX_KEY]: 1 },
    ])
  })

  it('loads no shares per token without tickers', async () => {
    await listAssets({ page: 1, pageSize: 10, sort: 'ticker', order: 'asc' })

    expect(loadSharesPerTokenMock).not.toHaveBeenCalled()
  })

  it('degrades when a shares multiplier source fails', async () => {
    loadSharesPerTokenMock.mockResolvedValue({ byKey: {}, degraded: true })

    const page = await listAssets({ page: 1, pageSize: 10, sort: 'ticker', order: 'asc', tickers: ['NVDA'] })

    expect(page.degraded).toBe(true)
  })

  it('gives every asset the markets of its own tokens only', async () => {
    const appleTokenMarket = { price: 251, marketCap: 10, volume24h: 1, logoUrl: null }
    getTokenMarketsMock.mockResolvedValue({ ...NVDA_TOKEN_MARKETS, 'apple-xstock': appleTokenMarket })

    const page = await listAssets({ page: 1, pageSize: 10, sort: 'ticker', order: 'asc', tickers: ['AAPL', 'NVDA'] })

    expect(page.items.map((item) => item.market?.tokens)).toEqual([
      { 'apple-xstock': appleTokenMarket },
      NVDA_TOKEN_MARKETS,
    ])
  })

  it('keeps the token markets of an asset missing from the RWA markets', async () => {
    getRwaMarketsMock.mockRejectedValue(new Error('CoinGecko responded with 429'))

    const page = await listAssets({ page: 1, pageSize: 10, sort: 'ticker', order: 'asc', tickers: ['NVDA'] })

    expect(page.degraded).toBe(true)
    expect(page.items[0]?.market).toMatchObject({ price: null, marketCap: null, tokens: NVDA_TOKEN_MARKETS })
  })

  it('keeps the asset prices and degrades when token markets fail', async () => {
    getTokenMarketsMock.mockRejectedValue(new Error('CoinGecko responded with 429'))

    const page = await listAssets({ page: 1, pageSize: 10, sort: 'ticker', order: 'asc', tickers: ['NVDA'] })

    expect(page.degraded).toBe(true)
    expect(page.items[0]?.market).toMatchObject({ price: 180, tokens: {} })
  })
})

describe('findAssets', () => {
  it('returns the matches with RWA market data and no per-token requests', async () => {
    const result = await findAssets('nvd', 10)

    expect(tickers(result.items)).toEqual(['NVDA'])
    expect(result.items[0]).toMatchObject({
      logoUrl: 'https://example.com/nvda.png',
      market: { price: 180, tokens: {} },
    })
    expect(getTokenMarketsMock).not.toHaveBeenCalled()
  })
})

describe('getAsset', () => {
  it('takes the headline from the RWA markets and the tokens from the asset tokens only', async () => {
    const asset = await getAsset('nvda')

    expect(getTokenMarketsMock).toHaveBeenCalledWith(nvda().tokens)
    expect(asset?.degraded).toBe(false)
    expect(asset?.market).toEqual({
      price: 180,
      change24h: expect.closeTo(((180 - 170) / 170) * 100),
      dayLow: 175,
      dayHigh: 182,
      marketCap: 1000,
      volume24h: 500,
      updatedAt: '2026-10-02T13:00:00.000Z',
      tokens: NVDA_TOKEN_MARKETS,
      sharesPerToken: SHARES_PER_TOKEN,
    })
    expect(loadSharesPerTokenMock).toHaveBeenCalledWith(nvda().tokens)
  })

  it('returns the trading pause of the asset', async () => {
    loadTradingPauseMock.mockResolvedValue(XSTOCKS_PAUSE)

    const asset = await getAsset('NVDA')

    expect(asset?.tradingPause).toEqual(XSTOCKS_PAUSE)
    expect(loadTradingPauseMock).toHaveBeenCalledWith(nvda())
  })

  it('degrades the asset when a shares multiplier source fails', async () => {
    loadSharesPerTokenMock.mockResolvedValue({ byKey: {}, degraded: true })

    const asset = await getAsset('NVDA')

    expect(asset?.degraded).toBe(true)
    expect(asset?.market).toMatchObject({ price: 180, sharesPerToken: {} })
  })

  it('keeps the headline when token markets fail', async () => {
    getTokenMarketsMock.mockRejectedValue(new Error('CoinGecko responded with 429'))

    const asset = await getAsset('NVDA')

    expect(asset?.degraded).toBe(true)
    expect(asset?.market).toMatchObject({ price: 180, tokens: {} })
  })

  it('degrades the asset when RWA markets fail', async () => {
    getRwaMarketsMock.mockRejectedValue(new Error('CoinGecko responded with 429'))

    const asset = await getAsset('NVDA')

    expect(asset?.degraded).toBe(true)
    expect(asset?.market).toBeNull()
  })

  it('returns a null market for an asset missing from the RWA markets', async () => {
    const asset = await getAsset('SPY')

    expect(asset?.market).toBeNull()
    expect(asset?.degraded).toBe(false)
  })

  it('returns null for an unknown ticker', async () => {
    expect(await getAsset('UNKNOWN')).toBeNull()
  })
})

describe('getAssetChart', () => {
  const TOKEN_POINTS = [
    { time: 1, value: 0.5 },
    { time: 2, value: 0.75 },
  ]

  beforeEach(() => {
    getChartMock.mockResolvedValue(TOKEN_POINTS)
  })

  it('converts the token prices to prices per share', async () => {
    loadSharesPerTokenMock.mockResolvedValue({ byKey: { [NVDAON_KEY]: 0.25 }, degraded: false })

    expect(await getAssetChart(nvda(), '1D')).toEqual([
      { time: 1, value: 2 },
      { time: 2, value: 3 },
    ])
    expect(getChartMock).toHaveBeenCalledTimes(1)
    expect(getChartMock).toHaveBeenCalledWith('nvidia-ondo-tokenized-stock', '1D')
    expect(loadSharesPerTokenMock).toHaveBeenCalledWith(nvda().tokens)
  })

  it('charts the next coin of the asset when the first one has no prices', async () => {
    getChartMock.mockImplementation(async (coingeckoId: string) =>
      coingeckoId === 'nvidia-xstock' ? TOKEN_POINTS : [],
    )
    loadSharesPerTokenMock.mockResolvedValue({ byKey: { [NVDAON_KEY]: 0.25, [NVDAX_KEY]: 0.5 }, degraded: false })

    expect(await getAssetChart(nvda(), '1D')).toEqual([
      { time: 1, value: 1 },
      { time: 2, value: 1.5 },
    ])
    expect(getChartMock.mock.calls).toEqual([
      ['nvidia-ondo-tokenized-stock', '1D'],
      ['nvidia-xstock', '1D'],
    ])
  })

  it('returns no points when no coin of the asset has prices', async () => {
    getChartMock.mockResolvedValue([])
    loadSharesPerTokenMock.mockResolvedValue({ byKey: { [NVDAON_KEY]: 0.25 }, degraded: false })

    expect(await getAssetChart(nvda(), '1D')).toEqual([])
    expect(getChartMock).toHaveBeenCalledTimes(2)
  })

  it('keeps the token prices when the multiplier is unknown', async () => {
    loadSharesPerTokenMock.mockResolvedValue({ byKey: {}, degraded: true })

    expect(await getAssetChart(nvda(), '1D')).toEqual(TOKEN_POINTS)
  })

  it('keeps the token prices when the tokens of the charted coin have different multipliers', async () => {
    const asset = nvda()
    const [ondoToken] = asset.tokens
    const bnbToken = { ...ondoToken, chainId: 56 }
    loadSharesPerTokenMock.mockResolvedValue({
      byKey: { [NVDAON_KEY]: 0.25, [`56:${ondoToken.address}`]: 0.5 },
      degraded: false,
    })

    expect(await getAssetChart({ ...asset, tokens: [ondoToken, bnbToken] }, '1D')).toEqual(TOKEN_POINTS)
  })
})

describe('getAssetCandles', () => {
  const TOKEN_CANDLES = [{ time: 1, open: 0.5, high: 1, low: 0.25, close: 0.75 }]

  beforeEach(() => {
    getCandlesMock.mockResolvedValue(TOKEN_CANDLES)
  })

  it('converts the token candles to candles per share', async () => {
    loadSharesPerTokenMock.mockResolvedValue({ byKey: { [NVDAON_KEY]: 0.25 }, degraded: false })

    expect(await getAssetCandles(nvda(), '1W')).toEqual([{ time: 1, open: 2, high: 4, low: 1, close: 3 }])
    expect(getCandlesMock).toHaveBeenCalledWith('nvidia-ondo-tokenized-stock', '1W')
  })

  it('takes the candles of the next coin of the asset when the first one has none', async () => {
    getCandlesMock.mockImplementation(async (coingeckoId: string) =>
      coingeckoId === 'nvidia-xstock' ? TOKEN_CANDLES : [],
    )
    loadSharesPerTokenMock.mockResolvedValue({ byKey: { [NVDAON_KEY]: 0.25, [NVDAX_KEY]: 0.5 }, degraded: false })

    expect(await getAssetCandles(nvda(), '1W')).toEqual([{ time: 1, open: 1, high: 2, low: 0.5, close: 1.5 }])
  })

  it('keeps the token candles when the multiplier is unknown', async () => {
    loadSharesPerTokenMock.mockResolvedValue({ byKey: {}, degraded: true })

    expect(await getAssetCandles(nvda(), '1W')).toEqual(TOKEN_CANDLES)
  })
})

describe('getAssetNetworkStats', () => {
  it('prices the stats with the tokens of the asset only', async () => {
    getNetworkStatsMock.mockResolvedValue([
      { address: '0x0000000000000000000000000000000000000002', onchainCap: 10, dexVolume24h: 1 },
    ])

    const stats = await getAssetNetworkStats(nvda(), 1)

    expect(getTokenMarketsMock).toHaveBeenCalledWith(nvda().tokens)
    expect(getNetworkStatsMock).toHaveBeenCalledWith(1, [nvda().tokens[0]], NVDA_TOKEN_MARKETS)
    expect(stats.degraded).toBe(false)
  })
})

describe('getMarketOverview', () => {
  it('aggregates the RWA markets of the registry', async () => {
    const overview = await getMarketOverview()
    const at = (iso: string): number => Date.parse(iso) / 1000

    expect(overview.degraded).toBe(false)
    expect(overview.totals.marketCap).toBe(4000)
    expect(overview.totals.volume24h).toBe(600)
    expect(overview.totals.marketCapSeries).toHaveLength(NVDA_SPARKLINE.length)
    expect(overview.totals.marketCapSeries?.at(-2)?.time).toBe(at('2026-10-02T12:00:00.000Z'))
    expect(overview.totals.marketCapSeries?.at(-2)?.value).toBeCloseTo((1000 / 180) * 170)
    expect(overview.totals.marketCapSeries?.at(-1)?.time).toBe(at('2026-10-02T13:00:00.000Z'))
    expect(overview.totals.marketCapSeries?.at(-1)?.value).toBeCloseTo(1000)
    expect(tickers(overview.mostTraded)).toEqual(['NVDA', 'AAPL'])
    expect(overview.mostTraded[0]).toMatchObject({
      logoUrl: 'https://example.com/nvda.png',
      volume24h: 500,
      series: [{ time: 1, value: 1 }],
    })
    expect(getHourlyDexVolumeMock).toHaveBeenCalledWith(nvda().tokens)
    expect(tickers(overview.gainers)).toEqual(['NVDA'])
    expect(overview.gainers[0]?.series).toEqual(NVDA_DAILY_SERIES)
    expect(tickers(overview.losers)).toEqual(['AAPL'])
    expect(overview.updatedAt).toBe('2026-10-02T13:05:00.000Z')
    expect(overview.tradingTime).toEqual({ title: 'US market open', start: '13:30 UTC', end: '20:00 UTC' })
    expect(getTokenMarketsMock).not.toHaveBeenCalled()
    expect(getNetworkStatsMock).not.toHaveBeenCalled()
  })

  it('takes the series of a mover without a full sparkline from its 1D chart', async () => {
    const chart = [
      { time: 1, value: 248 },
      { time: 2, value: 250 },
    ]
    getChartMock.mockResolvedValue(chart)

    const overview = await getMarketOverview()

    expect(overview.losers[0]?.series).toEqual(chart)
    expect(getChartMock).toHaveBeenCalledTimes(1)
    expect(getChartMock).toHaveBeenCalledWith('apple-xstock', '1D')
  })

  it('nulls the series of a mover whose 1D chart fails', async () => {
    getChartMock.mockRejectedValue(new Error('CoinGecko responded with 500'))

    const overview = await getMarketOverview()

    expect(overview.degraded).toBe(false)
    expect(overview.losers[0]?.series).toBeNull()
    expect(overview.gainers[0]?.series).toEqual(NVDA_DAILY_SERIES)
  })

  it('degrades and nulls the totals when the RWA markets fail', async () => {
    getRwaMarketsMock.mockRejectedValue(new Error('CoinGecko responded with 429'))

    const overview = await getMarketOverview()

    expect(overview.degraded).toBe(true)
    expect(overview.totals).toEqual({ marketCap: null, volume24h: null, marketCapSeries: null })
    expect(overview.mostTraded).toEqual([])
    expect(overview.gainers).toEqual([])
    expect(overview.losers).toEqual([])
  })

  it('nulls only the failed DEX volume series without degrading', async () => {
    getHourlyDexVolumeMock.mockRejectedValue(new Error('CoinGecko responded with 500'))

    const overview = await getMarketOverview()

    expect(overview.degraded).toBe(false)
    expect(overview.mostTraded.every(({ series }) => series === null)).toBe(true)
    expect(overview.gainers[0]?.series).toEqual(NVDA_DAILY_SERIES)
    expect(overview.totals.marketCapSeries).not.toBeNull()
  })
})
