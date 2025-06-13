import { backOff, BackoffOptions } from 'exponential-backoff'
import { RateLimiter, RateLimiterOpts } from 'limiter'

interface FetchWithRateLimit {
  rateLimit?: RateLimiterOpts // no rate-limit by default
  backoff?: BackoffOptions // basic exponential back-off by default
}

const REQUEST_TIMEOUT = 408
const TOO_EARLY = 425
const TOO_MANY_REQUESTS = 429
const INTERNAL_SERVER_ERROR = 500
const BAD_GATEWAY = 502
const SERVICE_UNAVAILABLE = 503
const GATEWAY_TIMEOUT = 504

const STATUS_CODES_TO_RETRY = [
  REQUEST_TIMEOUT,
  TOO_EARLY,
  TOO_MANY_REQUESTS,
  INTERNAL_SERVER_ERROR,
  BAD_GATEWAY,
  SERVICE_UNAVAILABLE,
  GATEWAY_TIMEOUT,
]

// See config in https://www.npmjs.com/package/@insertish/exponential-backoff
const DEFAULT_BACKOFF_OPTIONS: BackoffOptions = {
  numOfAttempts: 10,
  maxDelay: Infinity,
  jitter: 'none',
  retry: (err) => {
    if (err?.rawApiError?.status) {
      return STATUS_CODES_TO_RETRY.includes(err.rawApiError.status)
    }

    return true
  },
}

/**
 * Requests with rate limit and exponential backoff
 *
 * @param params allows to define the optional rate limit, and the back-off strategy
 * @returns the fetch function that would do the rate-limitted requests
 */
// Types reference: https://stackoverflow.com/questions/55059436/typescript-conditional-return-type-based-on-string-argument
export function fetchWithRateLimit(
  params?: FetchWithRateLimit
// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): <T extends (RequestInfo | URL) | (() => Promise<any>)>(
  input: T,
  init?: RequestInit
) => T extends () => infer R ? R : Promise<Response>
export function fetchWithRateLimit(
  params?: FetchWithRateLimit
): (
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: RequestInfo | URL | (() => Promise<any>),
  init?: RequestInit
) => typeof input extends () => infer R ? R : Promise<Response> {
  const { backoff, rateLimit } = params || {}

  // optionally rate limit
  const limiter = rateLimit ? new RateLimiter(rateLimit) : undefined

  return (input, init) =>
    backOff(
      async () => {
        if (limiter) {
          await limiter.removeTokens(1)
        }

        if (typeof input === 'function') {
          return input()
        }

        return fetch(input, init)
      },
      { ...DEFAULT_BACKOFF_OPTIONS, ...backoff }
    )
}

/**
 *
 * @param input Request info (as in the fetch method)
 * @param init Request options (as in fetch method)
 * @param backoffOptions Backoff parameters. By default It will wait a maximum of ~102s. Wait time is 100ms * 2**(attenmpt). Not more than 10 attempts
 * @returns A promise of the request
 */
export const fetchWithBackoff = fetchWithRateLimit()
