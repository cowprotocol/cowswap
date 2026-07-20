import { captureError, createCowLogger } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import { BalancesWatcherApiError, BalancesWatcherStreamError } from './types'

const HTTP_TOO_MANY_REQUESTS = 429

const logger = createCowLogger('BalancesWatcher')

// Session POST retries every ~30s and the first-snapshot timeout is ~20s, so one
// shared window keeps a sustained outage from emitting an event per retry.
const REPORT_THROTTLE_MS = ms`60s`
let lastReportedAt: number | undefined

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
 * Throttled to at most one report per window so a persistent outage does not flood Sentry.
 */
export function reportWatcherError({ error, phase, chainId }: ReportWatcherErrorParams): void {
  const now = Date.now()

  if (lastReportedAt !== undefined && now - lastReportedAt < REPORT_THROTTLE_MS) return
  lastReportedAt = now

  const { status, code } = extractWatcherErrorCodes(error)
  const isRateLimited = status === HTTP_TOO_MANY_REQUESTS

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

const ERROR_NAME_BY_PHASE = {
  session: 'BalancesWatcherSessionError',
  stream: 'BalancesWatcherStreamError',
  'first-snapshot-timeout': 'BalancesWatcherSnapshotTimeout',
} as const satisfies Record<WatcherErrorPhase, string>

function resolveErrorName(phase: WatcherErrorPhase, isRateLimited: boolean): string {
  return isRateLimited ? 'BalancesWatcherRateLimitError' : ERROR_NAME_BY_PHASE[phase]
}
