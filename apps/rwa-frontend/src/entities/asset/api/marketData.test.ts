/**
 * @jest-environment node
 */
import { coingeckoProvider, toChartPoints } from './marketData'

jest.mock('next/cache', () => ({
  unstable_cache: <T extends unknown[], R>(load: (...args: T) => Promise<R>) => load,
}))

import type { RwaAsset } from '../model/types'

const NVDA: RwaAsset = {
  ticker: 'NVDA',
  coingeckoId: 'nvda',
  title: 'NVIDIA',
  type: 'stock',
  priority: 9,
  tokens: [
    {
      chainId: 1,
      address: '0x2D1F7226Bd1F780AF6B9A49DCC0aE00E8Df4bDEE',
      symbol: 'NVDAon',
      name: 'NVIDIA (Ondo Tokenized)',
      decimals: 18,
      issuer: 'Ondo',
      coingeckoId: 'nvidia-ondo-tokenized-stock',
    },
    {
      chainId: 56,
      address: '0xA9ee28c80F960B889DFbd1902055218cba016F75',
      symbol: 'NVDAon',
      name: 'NVIDIA (Ondo Tokenized)',
      decimals: 18,
      issuer: 'Ondo',
      coingeckoId: 'nvidia-ondo-tokenized-stock',
    },
    {
      chainId: 1,
      address: '0xc845b2894dBddd03858fd2D643B4eF725fE0849d',
      symbol: 'NVDAx',
      name: 'NVIDIA xStock',
      decimals: 18,
      issuer: 'xStocks',
      coingeckoId: 'nvidia-xstock',
    },
  ],
}

const FULL_RWA_PAGE = Array.from({ length: 250 }, (_, index) => ({
  id: `rwa-${index}`,
  image: null,
  tokenized_market_data: null,
}))

const NO_DATA: RwaAsset = { ...NVDA, ticker: 'NONE', tokens: [{ ...NVDA.tokens[0], coingeckoId: undefined }] }

function mockFetch(body: unknown, ok = true): jest.Mock {
  const fetchMock = jest.fn().mockResolvedValue({ ok, status: ok ? 200 : 429, json: () => Promise.resolve(body) })
  global.fetch = fetchMock

  return fetchMock
}

describe('toChartPoints', () => {
  it('converts ms timestamps to seconds and keeps time strictly ascending', () => {
    expect(
      toChartPoints([
        [1_000, 1],
        [2_000, 2],
        [2_500, 3],
        [3_000, 4],
      ]),
    ).toEqual([
      { time: 1, value: 1 },
      { time: 2, value: 3 },
      { time: 3, value: 4 },
    ])
  })
})

describe('coingeckoProvider.getNetworkStats', () => {
  const TOKEN_MARKETS = {
    'nvidia-ondo-tokenized-stock': { price: 230, marketCap: null, volume24h: null, logoUrl: null },
  }

  it('values the network supply at the token price and keeps the DEX volume', async () => {
    const [ondo, xstock] = [NVDA.tokens[0], NVDA.tokens[2]]
    const fetchMock = mockFetch({
      data: [
        {
          attributes: {
            address: ondo?.address.toLowerCase(),
            normalized_total_supply: '1000.5',
            volume_usd: { h24: '814560.89' },
          },
        },
        { attributes: { address: xstock?.address, normalized_total_supply: null, volume_usd: { h24: '0.0' } } },
      ],
    })

    const stats = await coingeckoProvider.getNetworkStats(
      1,
      [ondo, xstock].filter((t) => t !== undefined),
      TOKEN_MARKETS,
    )

    expect(String(fetchMock.mock.calls[0][0])).toContain('/networks/eth/tokens/multi/')
    expect(stats).toEqual([
      { address: ondo?.address, onchainCap: 230_115, dexVolume24h: 814560.89 },
      { address: xstock?.address, onchainCap: null, dexVolume24h: 0 },
    ])
  })

  it('returns empty stats on a network the onchain API does not index', async () => {
    const fetchMock = mockFetch({})

    const [ondo] = NVDA.tokens

    expect(await coingeckoProvider.getNetworkStats(57073, ondo ? [ondo] : [], TOKEN_MARKETS)).toEqual([
      { address: ondo?.address, onchainCap: null, dexVolume24h: null },
    ])
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('coingeckoProvider.getHourlyDexVolume', () => {
  const NOW_SECONDS = 1_790_000_000
  const LAST_HOUR = 1_789_999_200
  const env = { ...process.env }

  beforeEach(() => {
    process.env.COINGECKO_API_KEY = 'key'
    process.env.COINGECKO_API_PLAN = 'pro'
    jest.spyOn(Date, 'now').mockReturnValue(NOW_SECONDS * 1000)
  })

  afterEach(() => {
    process.env = { ...env }
    jest.restoreAllMocks()
  })

  const [ondoEth, ondoBsc] = NVDA.tokens
  const tokens = [ondoEth, ondoBsc].filter((t) => t !== undefined)

  it('sums hourly candle volumes of every token into a 24h window', async () => {
    const fetchMock = mockFetch({
      data: {
        attributes: {
          ohlcv_list: [
            [LAST_HOUR, 1, 1, 1, 1, 10],
            [LAST_HOUR - 3600, 1, 1, 1, 1, 5],
          ],
        },
      },
    })

    const series = await coingeckoProvider.getHourlyDexVolume(tokens)

    expect(String(fetchMock.mock.calls[0][0])).toBe(
      `https://pro-api.coingecko.com/api/v3/onchain/networks/eth/tokens/${ondoEth?.address}/ohlcv/hour?aggregate=1&limit=24&currency=usd`,
    )
    expect(series).toHaveLength(24)
    expect(series?.[23]).toEqual({ time: LAST_HOUR, value: 20 })
    expect(series?.[22]).toEqual({ time: LAST_HOUR - 3600, value: 10 })
    expect(series?.[0]).toEqual({ time: LAST_HOUR - 23 * 3600, value: 0 })
  })

  it('treats 404 as a token without candles', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404, json: () => Promise.resolve({}) })

    const series = await coingeckoProvider.getHourlyDexVolume(tokens)

    expect(series).toHaveLength(24)
    expect(series?.every(({ value }) => value === 0)).toBe(true)
  })

  it('returns null without the Pro plan', async () => {
    process.env.COINGECKO_API_PLAN = 'demo'
    const fetchMock = mockFetch({})

    expect(await coingeckoProvider.getHourlyDexVolume(tokens)).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('throws on other upstream errors', async () => {
    mockFetch({}, false)

    await expect(coingeckoProvider.getHourlyDexVolume(tokens)).rejects.toThrow('responded with 429')
  })
})

describe('coingeckoProvider.getRwaMarkets', () => {
  it('pages until a short page and maps the tokenized market data', async () => {
    const lastPage = [
      {
        id: 'nvidia',
        image: 'nvda.png',
        tokenized_market_data: {
          current_price: 180,
          market_cap: 1000,
          total_volume: 50,
          high_24h: 182,
          low_24h: 175,
          price_change_percentage_24h: 1.5,
          last_updated: '2026-10-02T13:00:00Z',
          sparkline_in_7d: { price: [170, 180] },
        },
      },
    ]
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(FULL_RWA_PAGE) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(lastPage) })
    global.fetch = fetchMock

    const markets = await coingeckoProvider.getRwaMarkets(1)

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(String(fetchMock.mock.calls[0][0])).toContain('/rwas/markets?per_page=250&page=1&sparkline=true')
    expect(String(fetchMock.mock.calls[1][0])).toContain('/rwas/markets?per_page=250&page=2&sparkline=true')
    expect(markets.size).toBe(251)
    expect(markets.get('nvidia')).toEqual({
      price: 180,
      change24h: 1.5,
      dayLow: 175,
      dayHigh: 182,
      marketCap: 1000,
      volume24h: 50,
      updatedAt: '2026-10-02T13:00:00Z',
      sparkline7d: [170, 180],
    })
    expect(markets.get('rwa-0')).toEqual({
      price: null,
      change24h: null,
      dayLow: null,
      dayHigh: null,
      marketCap: null,
      volume24h: null,
      updatedAt: null,
      sparkline7d: [],
    })
  })

  it('requests the expected pages concurrently', async () => {
    const pending: ((page: unknown[]) => void)[] = []
    const fetchMock = jest.fn(
      () =>
        new Promise((resolve) => {
          pending.push((page) => resolve({ ok: true, status: 200, json: () => Promise.resolve(page) }))
        }),
    )
    global.fetch = fetchMock

    const result = coingeckoProvider.getRwaMarkets(400)
    await Promise.resolve()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain('&page=2&')

    pending[0]?.(FULL_RWA_PAGE)
    pending[1]?.([{ id: 'nvidia', image: null, tokenized_market_data: null }])

    expect((await result).size).toBe(251)
  })

  it('continues past the expected pages while the last page is full', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(FULL_RWA_PAGE) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve([]) })
    global.fetch = fetchMock

    const markets = await coingeckoProvider.getRwaMarkets(250)

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(markets.size).toBe(250)
  })

  it('maps keys missing inside tokenized_market_data to null', async () => {
    mockFetch([{ id: 'sparse', tokenized_market_data: { current_price: 5 } }] as unknown as Record<string, unknown>[])

    const markets = await coingeckoProvider.getRwaMarkets(1)

    expect(markets.get('sparse')).toEqual({
      price: 5,
      change24h: null,
      dayLow: null,
      dayHigh: null,
      marketCap: null,
      volume24h: null,
      updatedAt: null,
      sparkline7d: [],
    })
  })

  it('throws on upstream errors', async () => {
    mockFetch({}, false)

    await expect(coingeckoProvider.getRwaMarkets(1)).rejects.toThrow('responded with 429')
  })
})

describe('coingeckoProvider.getTokenMarkets', () => {
  it('requests the unique coins of the tokens only and keys them by coin id', async () => {
    const fetchMock = mockFetch([
      {
        id: 'nvidia-xstock',
        current_price: 231.8,
        market_cap: 43,
        total_volume: 5,
        image: 'xstock.png',
        high_24h: 232,
        low_24h: 223,
        price_change_percentage_24h: 2.6,
        last_updated: '2026-09-28T13:00:00.000Z',
      },
    ])

    const markets = await coingeckoProvider.getTokenMarkets(NVDA.tokens)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(fetchMock.mock.calls[0][0])).toContain('ids=nvidia-ondo-tokenized-stock,nvidia-xstock')
    expect(markets).toEqual({ 'nvidia-xstock': { price: 231.8, marketCap: 43, volume24h: 5, logoUrl: 'xstock.png' } })
  })

  it('makes no request when no token has a coingeckoId', async () => {
    const fetchMock = mockFetch([])

    expect(await coingeckoProvider.getTokenMarkets(NO_DATA.tokens)).toEqual({})
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
