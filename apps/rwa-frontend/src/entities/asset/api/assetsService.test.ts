/**
 * @jest-environment node
 */
import { getAsset, listAssets } from './assetsService'
import { coingeckoProvider } from './marketData'

jest.mock('./marketData', () => ({
  coingeckoProvider: { getMarketData: jest.fn(), getChart: jest.fn() },
}))

const getMarketDataMock = coingeckoProvider.getMarketData as jest.Mock

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
