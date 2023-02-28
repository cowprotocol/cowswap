import { backOff, BackoffOptions } from 'exponential-backoff'

import { RateLimiter, RateLimiterOpts } from 'limiter'

interface FetchWithRateLimit {
  rateLimit?: RateLimiterOpts // no rate-limit by default
  backoff?: BackoffOptions // basic exponential back-off by default
}

// See config in https://www.npmjs.com/package/@insertish/exponential-backoff
const DEFAULT_BACKOFF_OPTIONS: BackoffOptions = {
  numOfAttempts: 10,
  maxDelay: Infinity,
  jitter: 'none',
}

/**
 * Requests with rate limit and exponential backoff
 *
 * @param params allows to define the optional rate limit, and the back-off strategy
 * @returns the fetch function that would do the rate-limitted requests
 */
export function fetchWithRateLimit(
  params?: FetchWithRateLimit
): (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> {
  const { backoff, rateLimit } = params || {}

  // optionally rate limit
  let limiter = rateLimit ? new RateLimiter(rateLimit) : undefined

  return (input, init) =>
    backOff(
      async () => {
        if (limiter) {
          await limiter.removeTokens(1)
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
