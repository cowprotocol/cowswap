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
    expect(fetchFn).toHaveBeenCalledWith(PRIMARY_URL, INIT)
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
