import { captureError, createCowLogger } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import { BalancesWatcherApiError, BalancesWatcherStreamError } from './types'

const HTTP_TOO_MANY_REQUESTS = 429

// Dedicated logger for the balances-watcher SSE service. Errors from this service
// (session POST failures, backend limits, terminal stream errors, snapshot
// timeouts) are reported under this scope only, separate from the multicall path.
const logger = createCowLogger('BalancesWatcher')

// The session POST retries on a 30s interval and the first-snapshot timeout is
// ~20s, so a sustained outage would emit an event per retry. Report at most once
// per (chainId + phase + status + code) per window while keeping the errors visible.
const REPORT_THROTTLE_MS = ms`60s`
const lastReportedAt = new Map<string, number>()

export interface ReportWatcherErrorParams {
  error: unknown
  phase: WatcherErrorPhase
  chainId: SupportedChainId
}

/**
 * Which stage of the watcher lifecycle produced the error:
 * - `session` — POST `/sessions/{owner}` rejected (rate limit, backend limits, network)
 * - `stream` — terminal SSE `event: error` or transport failure
 * - `first-snapshot-timeout` — POST resolved but no snapshot arrived in time
 */
export type WatcherErrorPhase = 'session' | 'stream' | 'first-snapshot-timeout'

/**
 * Report a balances-watcher service failure to Sentry under the `BalancesWatcher`
 * scope. Provider rate-limiting (HTTP 429) is tagged distinctly (`rateLimited`,
 * `httpStatus: 429`), and the backend error `code` (limits, etc.) is preserved.
 * Throttled per (chainId + phase + status + code) so a persistent outage does not flood Sentry.
 */
export function reportWatcherError({ error, phase, chainId }: ReportWatcherErrorParams): void {
  const { status, code } = extractWatcherErrorCodes(error)
  const isRateLimited = status === HTTP_TOO_MANY_REQUESTS

  // Both status AND code so distinct backend limit errors sharing an HTTP status
  // (e.g. token-limit vs too-many-clients, both 400) throttle independently.
  const throttleKey = `${chainId}:${phase}:${status ?? 'x'}:${code ?? 'x'}`
  const now = Date.now()
  const last = lastReportedAt.get(throttleKey)

  if (last !== undefined && now - last < REPORT_THROTTLE_MS) return
  lastReportedAt.set(throttleKey, now)

  const message = error instanceof Error ? error.message : String(error)
  const sentryError = new Error(message, { cause: error })
  sentryError.name = resolveErrorName(phase, isRateLimited)

  logger.warn(`${sentryError.name} (phase: ${phase}, status: ${status ?? 'n/a'}, code: ${code ?? 'n/a'})`, {
    chainId,
    error,
  })

  captureError(
    sentryError,
    undefined,
    { chainId, phase, httpStatus: status, apiCode: code, message },
    {
      scope: 'BalancesWatcher',
      errorType: sentryError.name,
      phase,
      ...(status !== undefined ? { httpStatus: String(status) } : undefined),
      ...(isRateLimited ? { rateLimited: 'true' } : undefined),
    },
  )
}

function extractWatcherErrorCodes(error: unknown): { status?: number; code?: number } {
  if (error instanceof BalancesWatcherApiError) return { status: error.status, code: error.code }
  if (error instanceof BalancesWatcherStreamError) return { code: error.code }

  return {}
}

function resolveErrorName(phase: WatcherErrorPhase, isRateLimited: boolean): string {
  if (isRateLimited) return 'BalancesWatcherRateLimitError'

  switch (phase) {
    case 'session':
      return 'BalancesWatcherSessionError'
    case 'stream':
      return 'BalancesWatcherStreamError'
    case 'first-snapshot-timeout':
      return 'BalancesWatcherSnapshotTimeout'
  }
}
