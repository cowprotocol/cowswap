import { captureError, createCowLogger, normalizeError } from '@cowprotocol/common-utils'

import ms from 'ms.macro'

const HTTP_TOO_MANY_REQUESTS = 429
// Balances and slot reads poll continuously, so a sustained outage would otherwise emit one Sentry event per request.
const REPORT_THROTTLE_MS = ms`60s`

const logger = createCowLogger('SolanaRpc')

export interface SolanaRpcFetchParams {
  primaryUrl: string
  fallbackUrl: string
  fetchFn?: FetchFn
  now?: () => number
}

type FetchFn = typeof globalThis.fetch

/** Replays a request against `fallbackUrl` when `primaryUrl` responds with a non-2xx status or fails. */
export function createSolanaRpcFetch({
  primaryUrl,
  fallbackUrl,
  fetchFn = (...args) => globalThis.fetch(...args),
  now = Date.now,
}: SolanaRpcFetchParams): FetchFn {
  let lastReportedAt: number | undefined

  const report = (reason: Error, status: number | undefined): void => {
    const timestamp = now()

    if (lastReportedAt !== undefined && timestamp - lastReportedAt < REPORT_THROTTLE_MS) return
    lastReportedAt = timestamp

    const isRateLimited = status === HTTP_TOO_MANY_REQUESTS
    const sentryError = new Error(reason.message, { cause: reason })
    sentryError.name = isRateLimited ? 'SolanaRpcRateLimitError' : 'SolanaRpcError'

    logger.warn(`${sentryError.name} (status: ${status ?? 'n/a'}), falling back`, reason)

    captureError(
      sentryError,
      undefined,
      { httpStatus: status, message: sentryError.message },
      {
        scope: 'SolanaRpc',
        errorType: sentryError.name,
        ...(status !== undefined ? { httpStatus: String(status) } : undefined),
      },
    )
  }

  return async (input, init) => {
    if (primaryUrl === fallbackUrl || input.toString() !== primaryUrl) {
      return fetchFn(input, init)
    }

    try {
      const response = await fetchFn(input, init)

      if (!shouldFallback(response)) return response

      report(new Error(`Solana RPC responded with HTTP ${response.status}`), response.status)
    } catch (err: unknown) {
      const error = normalizeError(err)

      if (init?.signal?.aborted) throw error

      report(error, undefined)
    }

    return fetchFn(fallbackUrl, init)
  }
}

export function getReownRpcUrl(caipNetworkId: string, projectId: string): string {
  const url = new URL('https://rpc.walletconnect.org/v1/')
  url.searchParams.set('chainId', caipNetworkId)
  url.searchParams.set('projectId', projectId)

  return url.toString()
}

// JSON-RPC errors arrive as HTTP 200, so any other status means the provider refused the request
// (e.g. keyless publicnode answers 403 to `getMultipleAccounts` with more than 10 keys).
function shouldFallback(response: Response): boolean {
  return !response.ok
}
