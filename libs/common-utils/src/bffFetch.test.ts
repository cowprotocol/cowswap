import { bffFetch, setBffBearerToken } from './bffFetch'

const URL = 'https://bff.test/1/tokens/0x1/usdPrice'
const mockFetch = jest.fn()
global.fetch = mockFetch

function authOf(callIndex: number): string | null {
  const init: RequestInit | undefined = mockFetch.mock.calls[callIndex]?.[1]
  return new Headers(init?.headers).get('Authorization')
}

describe('bffFetch', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    setBffBearerToken(null)
  })

  it('sends no Authorization header without a token', async () => {
    mockFetch.mockResolvedValue({ status: 200 })

    await bffFetch(URL, { headers: { Accept: 'application/json' } })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(authOf(0)).toBeNull()
  })

  it('sends the token as a Bearer header and keeps other headers', async () => {
    setBffBearerToken('jwt')
    mockFetch.mockResolvedValue({ status: 200 })

    await bffFetch(URL, { headers: { Accept: 'application/json' } })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(authOf(0)).toBe('Bearer jwt')
    expect(new Headers(mockFetch.mock.calls[0][1].headers).get('Accept')).toBe('application/json')
  })

  it('retries without the token when the BFF rejects it with 401', async () => {
    setBffBearerToken('expired')
    mockFetch.mockResolvedValueOnce({ status: 401 }).mockResolvedValueOnce({ status: 200 })

    const response = await bffFetch(URL)

    expect(response.status).toBe(200)
    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(authOf(0)).toBe('Bearer expired')
    expect(authOf(1)).toBeNull()
  })

  it('skips the anonymous retry of a 401 once an overlapping request was rate limited', async () => {
    let resolveSecond: (response: unknown) => void = () => undefined
    setBffBearerToken('expired')
    mockFetch
      .mockResolvedValueOnce({ status: 401 })
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveSecond = resolve
        }),
      )
      .mockResolvedValueOnce({ status: 429, headers: new Headers({ 'Retry-After': '30' }) })

    const first = bffFetch(URL)
    const second = bffFetch(URL)
    await first
    resolveSecond({ status: 401 })

    expect((await second).status).toBe(429)
    expect(mockFetch).toHaveBeenCalledTimes(3)
    setBffBearerToken('jwt')
  })

  describe('after a 429', () => {
    // One clock for the block: the pause is module state, so each test must start after the previous one expired.
    beforeAll(() => jest.useFakeTimers())
    afterAll(() => jest.useRealTimers())
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({ status: 429, headers: new Headers({ 'Retry-After': '30' }) })
    })

    it('answers 429 without calling the BFF until Retry-After passes', async () => {
      await bffFetch(URL)
      const paused = await bffFetch(URL)

      expect(paused.status).toBe(429)
      expect(mockFetch).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(30_000)
      mockFetch.mockResolvedValueOnce({ status: 200 })

      expect((await bffFetch(URL)).status).toBe(200)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('calls the BFF again as soon as a new token is set', async () => {
      await bffFetch(URL)
      setBffBearerToken('jwt')
      mockFetch.mockResolvedValueOnce({ status: 200 })

      expect((await bffFetch(URL)).status).toBe(200)
      expect(authOf(1)).toBe('Bearer jwt')
    })

    it('does not pause for a 429 that answers a token replaced in the meantime', async () => {
      const pending = bffFetch(URL)
      setBffBearerToken('jwt')
      await pending
      mockFetch.mockResolvedValueOnce({ status: 200 })

      expect((await bffFetch(URL)).status).toBe(200)
    })

    it('does not pause for a 429 passed through from a proxied upstream', async () => {
      await bffFetch('https://bff.test/proxies/token-search')
      mockFetch.mockResolvedValueOnce({ status: 200 })

      expect((await bffFetch(URL)).status).toBe(200)
    })
  })
})
