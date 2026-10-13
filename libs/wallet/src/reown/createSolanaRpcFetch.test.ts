import { captureError } from '@cowprotocol/common-utils'

import { createSolanaRpcFetch, getReownRpcUrl } from './createSolanaRpcFetch'

jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('@cowprotocol/common-utils'),
  captureError: jest.fn(),
}))

const captureErrorMock = captureError as jest.Mock

const PRIMARY_URL = 'https://solana.example.com/key'
const FALLBACK_URL = 'https://rpc.walletconnect.org/v1/?chainId=solana%3Amainnet&projectId=abc'
const INIT: RequestInit = { method: 'POST', body: '{"jsonrpc":"2.0","id":1,"method":"getSlot"}' }

function hangingUntilAborted(init: RequestInit | undefined): Promise<Response> {
  return new Promise((_, reject) => {
    init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
  })
}

function response(status: number): Response {
  return new Response('{}', { status })
}

describe('createSolanaRpcFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns the primary response when it succeeds', async () => {
    const fetchFn = jest.fn().mockResolvedValue(response(200))
    const rpcFetch = createSolanaRpcFetch({ primaryUrl: PRIMARY_URL, fallbackUrl: FALLBACK_URL, fetchFn })

    const result = await rpcFetch(PRIMARY_URL, INIT)

    expect(result.status).toBe(200)
    expect(fetchFn).toHaveBeenCalledTimes(1)
    expect(fetchFn).toHaveBeenCalledWith(PRIMARY_URL, expect.objectContaining({ body: INIT.body }))
    expect(captureErrorMock).not.toHaveBeenCalled()
  })

  it.each([403, 429, 500, 503])('replays the request on the fallback when the primary returns %i', async (status) => {
    const fetchFn = jest.fn().mockResolvedValueOnce(response(status)).mockResolvedValueOnce(response(200))
    const rpcFetch = createSolanaRpcFetch({ primaryUrl: PRIMARY_URL, fallbackUrl: FALLBACK_URL, fetchFn })

    const result = await rpcFetch(PRIMARY_URL, INIT)

    expect(result.status).toBe(200)
    expect(fetchFn).toHaveBeenLastCalledWith(FALLBACK_URL, INIT)
  })

  it('reports a non-rate-limit refusal as a generic RPC error', async () => {
    const fetchFn = jest.fn().mockResolvedValueOnce(response(403)).mockResolvedValueOnce(response(200))
    const rpcFetch = createSolanaRpcFetch({ primaryUrl: PRIMARY_URL, fallbackUrl: FALLBACK_URL, fetchFn })

    await rpcFetch(PRIMARY_URL, INIT)

    expect(captureErrorMock.mock.calls[0][0].name).toBe('SolanaRpcError')
    expect(captureErrorMock.mock.calls[0][3]).toMatchObject({ httpStatus: '403' })
  })

  it('replays the request on the fallback when the primary request throws', async () => {
    const fetchFn = jest
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(response(200))
    const rpcFetch = createSolanaRpcFetch({ primaryUrl: PRIMARY_URL, fallbackUrl: FALLBACK_URL, fetchFn })

    const result = await rpcFetch(PRIMARY_URL, INIT)

    expect(result.status).toBe(200)
    expect(fetchFn).toHaveBeenLastCalledWith(FALLBACK_URL, INIT)
  })

  it('rethrows without falling back when the request was aborted', async () => {
    const controller = new AbortController()
    controller.abort()
    const fetchFn = jest.fn().mockRejectedValue(new Error('aborted'))
    const rpcFetch = createSolanaRpcFetch({ primaryUrl: PRIMARY_URL, fallbackUrl: FALLBACK_URL, fetchFn })

    await expect(rpcFetch(PRIMARY_URL, { ...INIT, signal: controller.signal })).rejects.toThrow('aborted')
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  describe('primary timeout', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('replays the request on the fallback when the primary does not respond in time', async () => {
      const fetchFn = jest.fn((url: RequestInfo | URL, init?: RequestInit) =>
        url === PRIMARY_URL ? hangingUntilAborted(init) : Promise.resolve(response(200)),
      )
      const rpcFetch = createSolanaRpcFetch({
        primaryUrl: PRIMARY_URL,
        fallbackUrl: FALLBACK_URL,
        fetchFn,
        timeoutMs: 1000,
      })

      const resultPromise = rpcFetch(PRIMARY_URL, INIT)
      await jest.advanceTimersByTimeAsync(1000)
      const result = await resultPromise

      expect(result.status).toBe(200)
      expect(fetchFn).toHaveBeenLastCalledWith(FALLBACK_URL, INIT)
      expect(captureErrorMock.mock.calls[0][0].message).toBe('Solana RPC did not respond within 1000ms')
    })

    it('does not time out sendTransaction', async () => {
      const sendInit: RequestInit = { method: 'POST', body: '{"method":"sendTransaction","params":["tx"]}' }
      let resolvePrimary: (value: Response) => void = () => undefined
      const fetchFn = jest.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolvePrimary = resolve
          }),
      )
      const rpcFetch = createSolanaRpcFetch({
        primaryUrl: PRIMARY_URL,
        fallbackUrl: FALLBACK_URL,
        fetchFn,
        timeoutMs: 1000,
      })

      const resultPromise = rpcFetch(PRIMARY_URL, sendInit)
      await jest.advanceTimersByTimeAsync(5000)
      resolvePrimary(response(200))

      expect((await resultPromise).status).toBe(200)
      expect(fetchFn).toHaveBeenCalledTimes(1)
    })

    it('does not fall back after a primary response that arrived in time', async () => {
      const fetchFn = jest.fn().mockResolvedValue(response(200))
      const rpcFetch = createSolanaRpcFetch({
        primaryUrl: PRIMARY_URL,
        fallbackUrl: FALLBACK_URL,
        fetchFn,
        timeoutMs: 1000,
      })

      await rpcFetch(PRIMARY_URL, INIT)
      await jest.advanceTimersByTimeAsync(5000)

      expect(fetchFn).toHaveBeenCalledTimes(1)
      expect(captureErrorMock).not.toHaveBeenCalled()
    })

    it('rethrows without falling back when the caller aborts while waiting', async () => {
      const controller = new AbortController()
      const fetchFn = jest.fn((_: RequestInfo | URL, init?: RequestInit) => hangingUntilAborted(init))
      const rpcFetch = createSolanaRpcFetch({
        primaryUrl: PRIMARY_URL,
        fallbackUrl: FALLBACK_URL,
        fetchFn,
        timeoutMs: 1000,
      })

      const resultPromise = rpcFetch(PRIMARY_URL, { ...INIT, signal: controller.signal })
      controller.abort()

      await expect(resultPromise).rejects.toThrow('aborted')
      expect(fetchFn).toHaveBeenCalledTimes(1)
    })
  })

  it('reports rate limiting to Sentry at most once per throttle window', async () => {
    let now = 0
    const fetchFn = jest.fn((url: RequestInfo | URL) => Promise.resolve(response(url === PRIMARY_URL ? 429 : 200)))
    const rpcFetch = createSolanaRpcFetch({
      primaryUrl: PRIMARY_URL,
      fallbackUrl: FALLBACK_URL,
      fetchFn,
      now: () => now,
    })

    await rpcFetch(PRIMARY_URL, INIT)
    await rpcFetch(PRIMARY_URL, INIT)
    expect(captureErrorMock).toHaveBeenCalledTimes(1)
    expect(captureErrorMock.mock.calls[0][0].name).toBe('SolanaRpcRateLimitError')
    expect(captureErrorMock.mock.calls[0][3]).toMatchObject({ scope: 'SolanaRpc', httpStatus: '429' })

    now = 60_000
    await rpcFetch(PRIMARY_URL, INIT)
    expect(captureErrorMock).toHaveBeenCalledTimes(2)
  })

  it('passes through requests to other URLs and when primary equals fallback', async () => {
    const fetchFn = jest.fn().mockResolvedValue(response(429))

    await createSolanaRpcFetch({ primaryUrl: PRIMARY_URL, fallbackUrl: FALLBACK_URL, fetchFn })('https://other', INIT)
    await createSolanaRpcFetch({ primaryUrl: PRIMARY_URL, fallbackUrl: PRIMARY_URL, fetchFn })(PRIMARY_URL, INIT)

    expect(fetchFn).toHaveBeenCalledTimes(2)
    expect(captureErrorMock).not.toHaveBeenCalled()
  })
})

describe('getReownRpcUrl', () => {
  it('builds the Reown blockchain API URL for a CAIP network', () => {
    const url = new URL(getReownRpcUrl('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', 'project'))

    expect(url.origin + url.pathname).toBe('https://rpc.walletconnect.org/v1/')
    expect(url.searchParams.get('chainId')).toBe('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')
    expect(url.searchParams.get('projectId')).toBe('project')
  })
})
