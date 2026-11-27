import { fetchWithTimeout, parseRetryAfter } from './api-utils'

type BffFetchInit = Parameters<typeof fetchWithTimeout>[1]

let bffBearerToken: string | null = null
let pausedUntil = 0

export async function bffFetch(input: string, init: BffFetchInit = {}): Promise<Response> {
  // Retrying while rate limited only spends the budget, and can turn a 429 into a longer block.
  if (Date.now() < pausedUntil) return new Response(null, { status: 429 })

  const token = bffBearerToken
  const response = await fetchWithBearer(input, init)

  // A 429 for a token replaced meanwhile, or passed through from a proxied upstream, doesn't limit the current token.
  if (response.status === 429 && token === bffBearerToken && !input.includes('/proxies/')) {
    pausedUntil = Date.now() + parseRetryAfter(response)
  }

  return response
}

export function setBffBearerToken(token: string | null): void {
  bffBearerToken = token
  // A new JWT has its own rate-limit budget.
  if (token) pausedUntil = 0
}

async function fetchWithBearer(input: string, init: BffFetchInit = {}): Promise<Response> {
  const token = bffBearerToken
  if (!token) return fetchWithTimeout(input, init)

  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${token}`)

  const response = await fetchWithTimeout(input, { ...init, headers })

  // BFF serves requests without a JWT but 401s an invalid one (expired, or issued by the other env's orderbook).
  if (response.status !== 401) return response

  // An overlapping request may have been rate limited while this one was in flight.
  return Date.now() < pausedUntil ? new Response(null, { status: 429 }) : fetchWithTimeout(input, init)
}
