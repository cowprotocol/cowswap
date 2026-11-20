import { captureError, createCowLogger, normalizeError } from '@cowprotocol/common-utils'

import ms from 'ms.macro'

const HTTP_TOO_MANY_REQUESTS = 429
// Balances and slot reads poll continuously, so a sustained outage would otherwise emit one Sentry event per request.
const REPORT_THROTTLE_MS = ms`60s`
const PRIMARY_TIMEOUT_MS = ms`5s`
const FALLBACK_TIMEOUT_MS = ms`15s`
const SENTRY_SCOPE = 'SolanaRpc'

const logger = createCowLogger(SENTRY_SCOPE)

export interface SolanaRpcFetchParams {
  primaryUrl: string
  fallbackUrl: string
  fetchFn?: FetchFn
  now?: () => number
  /** Time to wait for the primary's response headers before replaying against the fallback, in ms. */
  timeoutMs?: number
  /** Time to wait for the fallback's response headers before failing the request, in ms. */
  fallbackTimeoutMs?: number
}

type FetchFn = typeof globalThis.fetch

type PrimaryAttempt = { response: Response } | { failure: PrimaryFailure }

interface PrimaryFailure {
  reason: Error
  status?: number
}

type ReportOutcome = 'recovered' | 'failed'

interface RequestAbort {
  signal: AbortSignal
  isTimedOut(): boolean
  clear(): void
}

/** Replays a request against `fallbackUrl` when `primaryUrl` responds with a non-2xx status, fails, or times out. */
export function createSolanaRpcFetch({
  primaryUrl,
  fallbackUrl,
  fetchFn = (...args) => globalThis.fetch(...args),
  now = Date.now,
  timeoutMs = PRIMARY_TIMEOUT_MS,
  fallbackTimeoutMs = FALLBACK_TIMEOUT_MS,
}: SolanaRpcFetchParams): FetchFn {
  const lastReportedAt = new Map<ReportOutcome, number>()

  const report = ({ reason, status }: PrimaryFailure, recovered: boolean, fallbackError?: Error): void => {
    const outcome: ReportOutcome = recovered ? 'recovered' : 'failed'
    // Throttled per outcome, so a primary the fallback covered cannot silence a request that failed outright.
    const reportedAt = lastReportedAt.get(outcome)
    const timestamp = now()

    if (reportedAt !== undefined && timestamp - reportedAt < REPORT_THROTTLE_MS) return
    lastReportedAt.set(outcome, timestamp)

    const isRateLimited = status === HTTP_TOO_MANY_REQUESTS
    const sentryError = new Error(reason.message, { cause: reason })
    sentryError.name = isRateLimited ? 'SolanaRpcRateLimitError' : 'SolanaRpcError'

    logger.warn(`${sentryError.name} (status: ${status ?? 'n/a'}, outcome: ${outcome})`, reason)

    captureError(
      sentryError,
      undefined,
      {
        httpStatus: status,
        message: sentryError.message,
        ...(fallbackError ? { fallbackMessage: fallbackError.message } : undefined),
      },
      {
        scope: SENTRY_SCOPE,
        errorType: sentryError.name,
        recovered: String(recovered),
        ...(status !== undefined ? { httpStatus: String(status) } : undefined),
      },
      [SENTRY_SCOPE, sentryError.name, outcome],
    )
  }

  return async (input, init) => {
    if (primaryUrl === fallbackUrl || input.toString() !== primaryUrl) {
      return fetchFn(input, init)
    }

    const attempt = await fetchPrimary(fetchFn, input, init, timeoutMs)

    if ('response' in attempt) return attempt.response

    try {
      const response = await fetchFallback(fetchFn, fallbackUrl, init, fallbackTimeoutMs)
      const fallbackFailure = shouldFallback(response)
        ? new Error(`Solana RPC fallback responded with HTTP ${response.status}`)
        : undefined

      report(attempt.failure, !fallbackFailure, fallbackFailure)

      return response
    } catch (err: unknown) {
      const error = normalizeError(err)

      // The caller gave up while the fallback was in flight, so nothing about the RPC has been established.
      if (!init?.signal?.aborted) report(attempt.failure, false, error)

      throw error
    }
  }
}

export function getReownRpcUrl(caipNetworkId: string, projectId: string): string {
  const url = new URL('https://rpc.walletconnect.org/v1/')
  url.searchParams.set('chainId', caipNetworkId)
  url.searchParams.set('projectId', projectId)

  return url.toString()
}

function createRequestAbort(callerSignal: AbortSignal | null | undefined, timeoutMs: number | undefined): RequestAbort {
  const controller = new AbortController()
  const abortFromCaller = (): void => controller.abort(callerSignal?.reason)

  if (callerSignal?.aborted) {
    abortFromCaller()
  } else {
    callerSignal?.addEventListener('abort', abortFromCaller, { once: true })
  }

  let isTimedOut = false
  const timeoutId =
    timeoutMs === undefined
      ? undefined
      : setTimeout(() => {
          isTimedOut = true
          controller.abort()
        }, timeoutMs)

  return {
    signal: controller.signal,
    isTimedOut: () => isTimedOut,
    clear: () => clearTimeout(timeoutId),
  }
}

async function fetchFallback(
  fetchFn: FetchFn,
  fallbackUrl: string,
  init: RequestInit | undefined,
  timeoutMs: number,
): Promise<Response> {
  const fallbackAbort = createRequestAbort(init?.signal, isSendTransaction(init) ? undefined : timeoutMs)

  try {
    return await fetchFn(fallbackUrl, { ...init, signal: fallbackAbort.signal })
  } catch (err: unknown) {
    const error = normalizeError(err)

    if (!fallbackAbort.isTimedOut()) throw error

    throw new Error(`Solana RPC fallback did not respond within ${timeoutMs}ms`, { cause: error })
  } finally {
    fallbackAbort.clear()
  }
}

async function fetchPrimary(
  fetchFn: FetchFn,
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  timeoutMs: number,
): Promise<PrimaryAttempt> {
  const callerSignal = init?.signal
  const primaryAbort = createRequestAbort(callerSignal, isSendTransaction(init) ? undefined : timeoutMs)

  try {
    const response = await fetchFn(input, { ...init, signal: primaryAbort.signal })

    if (!shouldFallback(response)) return { response }

    return {
      failure: { reason: new Error(`Solana RPC responded with HTTP ${response.status}`), status: response.status },
    }
  } catch (err: unknown) {
    const error = normalizeError(err)

    if (callerSignal?.aborted) throw error

    return {
      failure: {
        reason: primaryAbort.isTimedOut() ? new Error(`Solana RPC did not respond within ${timeoutMs}ms`) : error,
      },
    }
  } finally {
    primaryAbort.clear()
  }
}

// A slow send must not be cut short: replaying it is harmless (same signature), but waiting is the expected behavior.
function isSendTransaction(init: RequestInit | undefined): boolean {
  return typeof init?.body === 'string' && init.body.includes('"method":"sendTransaction"')
}

// JSON-RPC errors arrive as HTTP 200, so any other status means the provider refused the request
// (e.g. keyless publicnode answers 403 to `getMultipleAccounts` with more than 10 keys).
function shouldFallback(response: Response): boolean {
  return !response.ok
}
