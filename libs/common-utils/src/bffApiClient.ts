import {
  fetchWithTimeout,
  JSON_HEADERS,
  parseJsonResponse,
  RetryableResponseError,
  STATUS_CODES_TO_RETRY,
} from './api-utils'
import { fetchWithRateLimit } from './fetchWithRateLimit'
import { stripTrailingSlash } from './url-utils'

import type { FetchJsonResponse } from './api-utils'

// Same shape as `fetchWithRateLimit()`'s result when called with a callback.
export type FetchRateLimited = (fn: () => Promise<Response>) => Promise<Response>

type FetchInit = NonNullable<Parameters<typeof fetchWithTimeout>[1]>

// Passed explicitly to opt a client out of the default rate-limit/retry behavior below,
// falling back to a single plain `fetchWithTimeout` call - distinct from omitting the
// constructor argument, which uses that default.
export const NO_RATE_LIMIT = Symbol('NO_RATE_LIMIT')

const DEFAULT_RATE_LIMIT_INTERVAL_MS = 200
const DEFAULT_BACKOFF_START_DELAY_MS = 1_000
const DEFAULT_BACKOFF_TIME_MULTIPLE = 3
const DEFAULT_BACKOFF_MAX_ATTEMPTS = 3

/**
 * Base class for BFF JSON API clients: builds the URL, applies a timeout, retries on
 * retryable status codes with rate-limiting/backoff by default, and parses the JSON
 * response. Pass `NO_RATE_LIMIT` for a client that should just make a single plain
 * `fetchWithTimeout` call instead (e.g. a background poll that already retries on its own
 * schedule), or a custom `FetchRateLimited` for different rate-limit/backoff tuning.
 */
export abstract class BffApiClient {
  protected readonly baseUrl: string
  private readonly fetchRateLimited: FetchRateLimited | typeof NO_RATE_LIMIT

  protected constructor(
    baseUrl: string,
    private readonly timeoutMs: number,
    private readonly timeoutMessage: string,
    fetchRateLimited: FetchRateLimited | typeof NO_RATE_LIMIT = createDefaultFetchRateLimited(),
  ) {
    this.baseUrl = stripTrailingSlash(baseUrl)
    this.fetchRateLimited = fetchRateLimited
  }

  protected buildUrl(path: string): string {
    return `${this.baseUrl}/${path.replace(/^\//, '')}`
  }

  protected async fetchJson<T>(path: string, init?: RequestInit): Promise<FetchJsonResponse<T>> {
    const response = await this.performFetch(this.buildUrl(path), {
      method: 'GET',
      headers: JSON_HEADERS,
      ...init,
      timeout: this.timeoutMs,
      timeoutMessage: this.timeoutMessage,
    })
    return parseJsonResponse<T>(response)
  }

  private performFetch(url: string, init: FetchInit): Promise<Response> {
    if (this.fetchRateLimited === NO_RATE_LIMIT) {
      return fetchWithTimeout(url, init)
    }

    return this.fetchRateLimited(async () => {
      const response = await fetchWithTimeout(url, init)
      if (STATUS_CODES_TO_RETRY.has(response.status)) {
        throw new RetryableResponseError(response.status)
      }
      return response
    })
  }
}

function createDefaultFetchRateLimited(): FetchRateLimited {
  return fetchWithRateLimit({
    rateLimit: { tokensPerInterval: 1, interval: DEFAULT_RATE_LIMIT_INTERVAL_MS },
    backoff: {
      numOfAttempts: DEFAULT_BACKOFF_MAX_ATTEMPTS,
      startingDelay: DEFAULT_BACKOFF_START_DELAY_MS,
      timeMultiple: DEFAULT_BACKOFF_TIME_MULTIPLE,
    },
  })
}
