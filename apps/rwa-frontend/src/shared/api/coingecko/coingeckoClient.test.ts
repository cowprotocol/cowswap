/**
 * @jest-environment node
 */
import { fetchMarketChart } from './coingeckoClient'

jest.mock('next/cache', () => ({
  unstable_cache: <T extends unknown[], R>(load: (...args: T) => Promise<R>) => load,
}))

describe('fetchMarketChart', () => {
  let now = 0

  beforeEach(() => {
    now = 1_790_000_000_000
    jest.spyOn(Date, 'now').mockImplementation(() => now)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('does not call the upstream again until the retry delay has passed', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 429, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ prices: [[1_000, 1]] }) })
    global.fetch = fetchMock

    await expect(fetchMarketChart('nvidia-xstock', '1', 300)).rejects.toThrow('responded with 429')
    await expect(fetchMarketChart('nvidia-xstock', '1', 300)).rejects.toThrow('next retry at')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    now += 60_000

    await expect(fetchMarketChart('nvidia-xstock', '1', 300)).resolves.toEqual({ prices: [[1_000, 1]] })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('fails on 404, so the stale entry is kept instead of caching an empty one', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404, json: () => Promise.resolve({}) })

    await expect(fetchMarketChart('delisted-xstock', '1', 300)).rejects.toThrow('responded with 404')
  })

  it('times out a hanging request', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ prices: [] }) })
    global.fetch = fetchMock

    await fetchMarketChart('tesla-xstock', '7', 900)

    expect(fetchMock.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal)
  })
})
