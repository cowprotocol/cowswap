import { tryParseJson } from './json-utils'
import { getTimeoutAbortController } from './request'

export const TIMEOUT_ERROR_MESSAGE = 'Request timed out. Please try again.'
const DEFAULT_RETRY_AFTER_MS = 60_000
export const JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
}

export type ApiErrorPayload =
  | {
      message?: string
    }
  | undefined

export type FetchJsonResponse<T> = {
  response: Response
  data?: T
  text: string
}

interface FetchTimeoutOptions extends RequestInit {
  timeout?: number
  timeoutMessage?: string
}

enum RetryableStatusCode {
  RequestTimeout = 408,
  TooEarly = 425,
  TooManyRequests = 429,
  InternalServerError = 500,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
}

export const STATUS_CODES_TO_RETRY: ReadonlySet<number> = new Set(
  Object.values(RetryableStatusCode).filter((value): value is number => typeof value === 'number'),
)

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, text: string, data?: ApiErrorPayload) {
    super(data?.message || text || `API error (${status})`)
    this.status = status
  }
}

export class RetryableResponseError extends Error {
  readonly rawApiError: { status: number }

  constructor(status: number) {
    super(`Retryable response (${status})`)
    this.rawApiError = { status }
  }
}

export async function fetchWithTimeout(input: RequestInfo | URL, options: FetchTimeoutOptions = {}): Promise<Response> {
  const { timeout = 30000, timeoutMessage = TIMEOUT_ERROR_MESSAGE, ...fetchOptions } = options

  try {
    const response = await fetch(input, { signal: getTimeoutAbortController(timeout).signal, ...fetchOptions })
    return response
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(timeoutMessage)
    }
    throw error
  }
}

export async function parseJsonResponse<T>(response: Response): Promise<FetchJsonResponse<T>> {
  const text = await response.text().catch(() => '')
  const data = text ? tryParseJson<T>(text) : undefined

  return { response, data, text }
}

/**
 * Milliseconds to wait after a 429, from `Retry-After` (seconds or an HTTP date). 60s when the header is
 * missing or unreadable, which is the default cross-origin unless the server lists it in `Access-Control-Expose-Headers`.
 */
export function parseRetryAfter(response: Pick<Response, 'headers'>): number {
  const value = response.headers.get('Retry-After')
  const seconds = Number(value)

  if (value && Number.isFinite(seconds)) return Math.max(0, seconds * 1000)

  const date = value ? Date.parse(value) : NaN

  return Number.isNaN(date) ? DEFAULT_RETRY_AFTER_MS : Math.max(0, date - Date.now())
}

export function unwrapOk<T>(result: FetchJsonResponse<T>, missingMessage: string): T {
  const { response, data, text } = result

  if (response.ok) {
    if (!data) {
      throw new ApiError(response.status, text, { message: missingMessage })
    }
    return data
  }

  throw new ApiError(response.status, text, data as ApiErrorPayload)
}
