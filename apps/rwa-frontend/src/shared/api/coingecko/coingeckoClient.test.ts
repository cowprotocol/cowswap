/**
 * @jest-environment node
 */
import { fetchMarketChart } from './coingeckoClient'

// Like the Next data cache, keeps the first successful entry and serves it however old it is
jest.mock('next/cache', () => ({
  unstable_cache: <T extends unknown[], R>(load: (...args: T) => Promise<R>) => {
    const entries = new Map<string, R>()

    return async (...args: T): Promise<R> => {
      const key = JSON.stringify(args)
      const cached = entries.get(key)

      if (cached !== undefined) return cached

      const result = await load(...args)
      entries.set(key, result)

      return result
    }
  },
}))

function jsonResponse(body: unknown, status = 200): Partial<Response> {
  return { ok: status === 200, status, json: () => Promise.resolve(body) }
}

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

  it('serves a cached entry younger than two revalidate periods', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ prices: [[1_000, 1]] }))
      .mockResolvedValueOnce(jsonResponse({ prices: [[2_000, 2]] }))
    global.fetch = fetchMock

    await fetchMarketChart('apple-xstock', '1', 300)
    now += 600_000

    await expect(fetchMarketChart('apple-xstock', '1', 300)).resolves.toEqual({ prices: [[1_000, 1]] })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('refetches a cached entry older than two revalidate periods', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ prices: [[1_000, 1]] }))
      .mockResolvedValueOnce(jsonResponse({ prices: [[2_000, 2]] }))
    global.fetch = fetchMock

    await fetchMarketChart('microsoft-xstock', '1', 300)
    now += 2 * 24 * 3_600_000

    await expect(fetchMarketChart('microsoft-xstock', '1', 300)).resolves.toEqual({ prices: [[2_000, 2]] })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('serves an old cached entry when its refetch fails', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ prices: [[1_000, 1]] }))
      .mockResolvedValueOnce(jsonResponse({}, 429))
    jest.spyOn(console, 'warn').mockImplementation(() => undefined)

    await fetchMarketChart('amazon-xstock', '1', 300)
    now += 2 * 24 * 3_600_000

    await expect(fetchMarketChart('amazon-xstock', '1', 300)).resolves.toEqual({ prices: [[1_000, 1]] })
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
