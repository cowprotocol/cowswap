import { assetChartQueryOptions, fetchAssetsByTickers } from './assetsQueries'

import type { RwaChart } from '../model/types'

import { rwaFetcher } from '@/shared/api'

jest.mock('@/shared/api', () => ({
  RWA_API_PREFIX: '/api/v1/',
  RWA_QUERY_KEY_ROOT: 'rwa',
  rwaFetcher: jest.fn(),
}))

const rwaFetcherMock = rwaFetcher as jest.Mock

function requestedTickers(call: [string]): string[] {
  return new URL(call[0], 'https://rwa.test').searchParams.get('tickers')?.split(',') ?? []
}

describe('fetchAssetsByTickers', () => {
  beforeEach(() => {
    rwaFetcherMock.mockReset()
    rwaFetcherMock.mockImplementation(async (url: string) => ({
      items: requestedTickers([url]).map((ticker) => ({ ticker })),
      degraded: false,
    }))
  })

  it('requests every ticker in pages of at most 100', async () => {
    const tickers = Array.from({ length: 205 }, (_, index) => `T${index}`)

    const { items, degraded } = await fetchAssetsByTickers(tickers)

    expect(rwaFetcherMock.mock.calls.map((call) => requestedTickers(call).length)).toEqual([100, 100, 5])
    expect(items.map((item) => item.ticker)).toEqual(tickers)
    expect(degraded).toBe(false)
  })

  it('is degraded when any page is, so the query persistence skips it', async () => {
    rwaFetcherMock.mockImplementation(async (url: string) => {
      const tickers = requestedTickers([url])

      return { items: tickers.map((ticker) => ({ ticker })), degraded: tickers.includes('T150') }
    })

    const { degraded } = await fetchAssetsByTickers(Array.from({ length: 205 }, (_, index) => `T${index}`))

    expect(degraded).toBe(true)
  })

  it('requests nothing without tickers', async () => {
    expect(await fetchAssetsByTickers([])).toEqual({ items: [], degraded: false })
    expect(rwaFetcherMock).not.toHaveBeenCalled()
  })
})

describe('assetChartQueryOptions', () => {
  const previous: RwaChart = { ticker: 'NVDA', range: '1W', points: [], degraded: false }

  function placeholderFor(previousKey: unknown[]): unknown {
    const { placeholderData } = assetChartQueryOptions('NVDA', '1D', 'stock')

    if (typeof placeholderData !== 'function') throw new Error('Expected a placeholder function')

    return placeholderData(previous, { queryKey: previousKey } as never)
  }

  it('keeps the previous chart of the same market while loading', () => {
    expect(placeholderFor(['rwa', 'chart', 'NVDA', '1W', 'stock'])).toBe(previous)
  })

  it('does not stand in the chart of the other market', () => {
    expect(placeholderFor(['rwa', 'chart', 'NVDA', '1D', 'tokenized'])).toBeUndefined()
  })
})
