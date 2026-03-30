import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Codex } from '@codex-data/sdk'

import { fetchPriceChartData } from './fetchPriceChartData'

import { DEFAULT_CODEX_API_KEY } from '../lib/priceChart.constants'

jest.mock('@codex-data/sdk', () => ({
  Codex: jest.fn(),
}))

const mockGetTokenBars = jest.fn()
const mockedCodex = jest.mocked(Codex)
const originalCodexApiKey = process.env.REACT_APP_CODEX_API_KEY
const originalDefinedApiKey = process.env.REACT_APP_DEFINED_API_KEY

describe('fetchPriceChartData', () => {
  beforeEach(() => {
    process.env.REACT_APP_CODEX_API_KEY = 'codex-test-key'
    process.env.REACT_APP_DEFINED_API_KEY = 'defined-test-key'
    mockGetTokenBars.mockReset()
    mockedCodex.mockReset()
    mockedCodex.mockImplementation(
      () =>
        ({
          queries: {
            getTokenBars: mockGetTokenBars,
          },
        }) as unknown as Codex,
    )
  })

  afterAll(() => {
    process.env.REACT_APP_CODEX_API_KEY = originalCodexApiKey
    process.env.REACT_APP_DEFINED_API_KEY = originalDefinedApiKey
  })

  it('fetches token bars through the Codex SDK and maps the response', async () => {
    mockGetTokenBars.mockResolvedValue({
      getTokenBars: {
        o: [1, 2],
        h: [3, 4],
        l: [0.5, 1.5],
        c: [2.5, 3.5],
        t: [1710000000, 1710003600],
        s: 'ok',
        volume: ['100.25', '200.50'],
      },
    })

    const result = await fetchPriceChartData({
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      chainId: SupportedChainId.MAINNET,
      from: 1710000000,
      to: 1710007200,
      resolution: '60',
    })

    expect(result).toEqual([
      {
        open: 1,
        high: 3,
        low: 0.5,
        close: 2.5,
        time: 1710000000,
        status: 'ok',
        volume: '100.25',
      },
      {
        open: 2,
        high: 4,
        low: 1.5,
        close: 3.5,
        time: 1710003600,
        status: 'ok',
        volume: '200.50',
      },
    ])

    expect(mockedCodex).toHaveBeenCalledWith(
      'codex-test-key',
      expect.objectContaining({
        ws: false,
        fetch: expect.any(Function),
      }),
    )

    expect(mockGetTokenBars).toHaveBeenCalledWith({
      symbol: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48:1',
      from: 1710000000,
      to: 1710007200,
      resolution: '60',
      currencyCode: 'USD',
      countback: undefined,
      removeEmptyBars: true,
      removeLeadingNullValues: true,
    })
  })

  it('uses the legacy Defined env var as a fallback', async () => {
    delete process.env.REACT_APP_CODEX_API_KEY
    mockGetTokenBars.mockResolvedValue({
      getTokenBars: {
        o: [],
        h: [],
        l: [],
        c: [],
        t: [],
        s: 'ok',
      },
    })

    await fetchPriceChartData({
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      chainId: SupportedChainId.MAINNET,
      from: 1710000000,
      to: 1710007200,
      resolution: '60',
    })

    expect(mockedCodex).toHaveBeenCalledWith(
      'defined-test-key',
      expect.objectContaining({
        ws: false,
      }),
    )
  })

  it('uses the built-in fallback key when both env vars are missing', async () => {
    delete process.env.REACT_APP_CODEX_API_KEY
    delete process.env.REACT_APP_DEFINED_API_KEY
    mockGetTokenBars.mockResolvedValue({
      getTokenBars: {
        o: [],
        h: [],
        l: [],
        c: [],
        t: [],
        s: 'ok',
      },
    })

    await fetchPriceChartData({
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      chainId: SupportedChainId.MAINNET,
      from: 1710000000,
      to: 1710007200,
      resolution: '60',
    })

    expect(mockedCodex).toHaveBeenCalledWith(
      DEFAULT_CODEX_API_KEY,
      expect.objectContaining({
        ws: false,
        fetch: expect.any(Function),
      }),
    )

    expect(mockGetTokenBars).toHaveBeenCalledWith({
      symbol: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48:1',
      from: 1710000000,
      to: 1710007200,
      resolution: '60',
      currencyCode: 'USD',
      countback: undefined,
      removeEmptyBars: true,
      removeLeadingNullValues: true,
    })
  })

  it('throws when the SDK returns no token bars', async () => {
    mockGetTokenBars.mockResolvedValue({
      getTokenBars: null,
    })

    await expect(
      fetchPriceChartData({
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        chainId: SupportedChainId.MAINNET,
        from: 1710000000,
        to: 1710007200,
        resolution: '60',
      }),
    ).rejects.toThrow('Codex price chart response is empty')
  })

  it('bubbles SDK query errors', async () => {
    mockGetTokenBars.mockRejectedValue(new Error('No access'))

    await expect(
      fetchPriceChartData({
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        chainId: SupportedChainId.MAINNET,
        from: 1710000000,
        to: 1710007200,
        resolution: '60',
      }),
    ).rejects.toThrow('No access')
  })

  it('filters out bars with null OHLC values', async () => {
    mockGetTokenBars.mockResolvedValue({
      getTokenBars: {
        o: [1, null],
        h: [3, 4],
        l: [0.5, 1.5],
        c: [2.5, 3.5],
        t: [1710000000, 1710003600],
        s: 'ok',
        volume: ['100.25', '200.50'],
      },
    })

    await expect(
      fetchPriceChartData({
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        chainId: SupportedChainId.MAINNET,
        from: 1710000000,
        to: 1710007200,
        resolution: '60',
      }),
    ).resolves.toEqual([
      {
        open: 1,
        high: 3,
        low: 0.5,
        close: 2.5,
        time: 1710000000,
        status: 'ok',
        volume: '100.25',
      },
    ])
  })

  it('throws on inconsistent bar array lengths', async () => {
    mockGetTokenBars.mockResolvedValue({
      getTokenBars: {
        o: [1],
        h: [3, 4],
        l: [0.5],
        c: [2.5],
        t: [1710000000],
        s: 'ok',
      },
    })

    await expect(
      fetchPriceChartData({
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        chainId: SupportedChainId.MAINNET,
        from: 1710000000,
        to: 1710007200,
        resolution: '60',
      }),
    ).rejects.toThrow('Codex price chart response has inconsistent array lengths')
  })
})
