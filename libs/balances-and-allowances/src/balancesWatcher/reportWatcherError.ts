import { captureError, createCowLogger, normalizeError } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import { BalancesWatcherApiError, BalancesWatcherStreamError } from './types'

const HTTP_TOO_MANY_REQUESTS = 429

const logger = createCowLogger('BalancesWatcher')

// Session POST retries every ~30s and the first-snapshot timeout is ~20s, so the
// caller throttles reporting to this window (see `useThrottledCallback` in
// useBalancesWatcherSession) to keep a sustained outage from flooding Sentry.
export const REPORT_THROTTLE_MS = ms`60s`

export interface ReportWatcherErrorParams {
  error: unknown
  phase: WatcherErrorPhase
  chainId: SupportedChainId | undefined
  /**
   * Sentry scope name. Defaults to `BalancesWatcher` (single-chain path);
   * pass `BalancesAggregator` for the multi-chain aggregator session.
   */
  scope?: string
}

/**
 * Which stage of the watcher lifecycle produced the error:
 * - `session` — POST `/sessions/{owner}` rejected (rate limit, backend limits, network)
 * - `stream` — terminal SSE `event: error` or transport failure
 * - `first-snapshot-timeout` — POST resolved but no snapshot arrived in time
 */
export type WatcherErrorPhase = 'session' | 'stream' | 'first-snapshot-timeout'

/**
 * Report a balances-watcher (or balances-aggregator) service failure to Sentry.
 * Provider rate-limiting (HTTP 429) is tagged distinctly (`rateLimited`,
 * `httpStatus: 429`), and the backend error `code` (limits, etc.) is preserved.
 * Throttled to at most one report per window so a persistent outage does not flood Sentry.
 */
export function reportWatcherError({
  error,
  phase,
  chainId,
  scope = 'BalancesWatcher',
}: ReportWatcherErrorParams): void {
  const { status, code } = extractWatcherErrorCodes(error)
  const isRateLimited = status === HTTP_TOO_MANY_REQUESTS

  const normalizedError = normalizeError(error)
  const { message } = normalizedError
  const sentryError = new Error(message, { cause: normalizedError })
  sentryError.name = resolveErrorName(phase, isRateLimited, scope)

  logger.warn(`${sentryError.name} (phase: ${phase}, status: ${status ?? 'n/a'}, code: ${code ?? 'n/a'})`, {
    chainId,
    error,
  })

  captureError(
    sentryError,
    undefined,
    { chainId, phase, httpStatus: status, apiCode: code, message },
    {
      scope,
      errorType: sentryError.name,
      phase,
      ...(status !== undefined ? { httpStatus: String(status) } : undefined),
      ...(isRateLimited ? { rateLimited: 'true' } : undefined),
    },
  )
}

// Duck-typed (not `instanceof`) so this also covers the aggregator's
// `BalancesAggregatorApiError`/`BalancesAggregatorStreamError` (same shape)
// without this module importing from the sibling `balancesAggregator` folder.
function extractWatcherErrorCodes(error: unknown): { status?: number; code?: number } {
  if (error instanceof BalancesWatcherApiError) return { status: error.status, code: error.code }
  if (error instanceof BalancesWatcherStreamError) return { code: error.code }
  if (!error || typeof error !== 'object') return {}

  const record = error as Record<string, unknown>
  return { status: readNumberProp(record, 'status'), code: readNumberProp(record, 'code') }
}

function readNumberProp(obj: Record<string, unknown>, key: string): number | undefined {
  const value = obj[key]
  return typeof value === 'number' ? value : undefined
}

const ERROR_NAME_SUFFIX_BY_PHASE = {
  session: 'SessionError',
  stream: 'StreamError',
  'first-snapshot-timeout': 'SnapshotTimeout',
} as const satisfies Record<WatcherErrorPhase, string>

function resolveErrorName(phase: WatcherErrorPhase, isRateLimited: boolean, scope: string): string {
  return isRateLimited ? `${scope}RateLimitError` : `${scope}${ERROR_NAME_SUFFIX_BY_PHASE[phase]}`
}
