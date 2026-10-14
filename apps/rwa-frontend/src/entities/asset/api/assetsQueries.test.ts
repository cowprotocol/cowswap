import { fetchAssetsByTickers } from './assetsQueries'

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
    }))
  })

  it('requests every ticker in pages of at most 100', async () => {
    const tickers = Array.from({ length: 205 }, (_, index) => `T${index}`)

    const items = await fetchAssetsByTickers(tickers)

    expect(rwaFetcherMock.mock.calls.map((call) => requestedTickers(call).length)).toEqual([100, 100, 5])
    expect(items.map((item) => item.ticker)).toEqual(tickers)
  })

  it('requests nothing without tickers', async () => {
    expect(await fetchAssetsByTickers([])).toEqual([])
    expect(rwaFetcherMock).not.toHaveBeenCalled()
  })
})
