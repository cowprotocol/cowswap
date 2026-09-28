export const RWA_API_PREFIX = '/api/v1/'

/** First element of every query key of this app, used to tell app queries apart from wallet ones */
export const RWA_QUERY_KEY_ROOT = 'rwa'

/** `degraded: true` marks a response built without some upstream data, it must not be cached */
export interface DegradableResponse {
  degraded: boolean
}

export interface RwaApiError {
  error: string
}

export class RwaApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

export function isDegradedResponse(data: unknown): boolean {
  return typeof data === 'object' && data !== null && 'degraded' in data && data.degraded === true
}

export async function rwaFetcher<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as RwaApiError | null

    throw new RwaApiRequestError(body?.error ?? `Request failed with ${response.status}`, response.status)
  }

  return response.json() as Promise<T>
}
