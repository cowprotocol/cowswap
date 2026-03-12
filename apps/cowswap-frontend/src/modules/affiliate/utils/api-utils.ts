export const TIMEOUT_ERROR_MESSAGE = 'Unable to reach referral service'

export const JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
}

export type FetchJsonResponse<T> = {
  response: Response
  data?: T
  text: string
}

export type ApiErrorPayload =
  | {
      message?: string
    }
  | undefined

export class RetryableResponseError extends Error {
  readonly rawApiError: { status: number }

  constructor(status: number) {
    super(`Retryable response (${status})`)
    this.rawApiError = { status }
  }
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
    super(data?.message || text || `Referral service error (${status})`)
    this.status = status
  }
}

export async function parseJsonResponse<T>(response: Response): Promise<FetchJsonResponse<T>> {
  const text = await response.text().catch(() => '')
  let data: T | undefined

  if (text) {
    try {
      data = JSON.parse(text) as T
    } catch {
      data = undefined
    }
  }

  return { response, data, text }
}

export async function fetchWithTimeout(input: RequestInfo, init: RequestInit, timeoutMs?: number): Promise<Response> {
  if (!timeoutMs) {
    return fetch(input, init)
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(TIMEOUT_ERROR_MESSAGE)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
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
