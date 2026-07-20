import { BaseError, HttpRequestError } from 'viem'

import { captureError, createCowLogger } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

const HTTP_TOO_MANY_REQUESTS = 429

const logger = createCowLogger('BalancesMulticall')

// Balances are refetched on an interval, so a sustained provider rate-limit would
// otherwise emit one Sentry event per poll. Report at most once per
// (chainId + status) per window while still keeping the errors visible.
const REPORT_THROTTLE_MS = ms`60s`
const lastReportedAt = new Map<string, number>()

export interface ReportBalancesErrorParams {
  error: unknown
  chainId: SupportedChainId
  tokenAddressesCount: number
}

export function getRpcHttpErrorStatus(error: unknown): number | undefined {
  if (error instanceof BaseError) {
    const httpError = error.walk((e) => e instanceof HttpRequestError)

    if (httpError instanceof HttpRequestError && typeof httpError.status === 'number') {
      return httpError.status
    }
  }

  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status?: unknown }).status

    if (typeof status === 'number') return status
  }

  return undefined
}

/**
 * Report a balances multicall failure to Sentry. Provider rate-limiting (HTTP
 * 429) is tagged distinctly (`errorType: BalancesRateLimitError`, `httpStatus:
 * 429`) so it can be searched/alerted on.
 */
export function reportBalancesError({ error, chainId, tokenAddressesCount }: ReportBalancesErrorParams): void {
  const status = getRpcHttpErrorStatus(error)
  const isRateLimited = status === HTTP_TOO_MANY_REQUESTS

  const throttleKey = `${chainId}:${status ?? 'unknown'}`
  const now = Date.now()
  const last = lastReportedAt.get(throttleKey)

  if (last !== undefined && now - last < REPORT_THROTTLE_MS) return
  lastReportedAt.set(throttleKey, now)

  // Wrap instead of mutating the original error — it is owned by react-query/wagmi
  // and shared with other consumers (balancesAtom.error, viem's own formatting).
  const sentryError = new Error(error instanceof Error ? error.message : String(error), { cause: error })
  // Name drives Sentry's default issue grouping; keep rate-limits in their own bucket.
  sentryError.name = isRateLimited ? 'BalancesRateLimitError' : 'BalancesMulticallError'

  logger.warn(`${sentryError.name} (status: ${status ?? 'n/a'})`, { chainId, tokenAddressesCount, error })

  captureError(
    sentryError,
    undefined,
    {
      chainId,
      tokenAddressesCount,
      httpStatus: status,
      message: sentryError.message,
    },
    {
      scope: 'Balances',
      errorType: sentryError.name,
      ...(status !== undefined ? { httpStatus: String(status) } : undefined),
    },
  )
}
