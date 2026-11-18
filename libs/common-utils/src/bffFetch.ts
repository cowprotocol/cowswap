import { fetchWithTimeout } from './api-utils'

let bffBearerToken: string | null = null

export async function bffFetch(
  input: RequestInfo | URL,
  init: Parameters<typeof fetchWithTimeout>[1] = {},
): Promise<Response> {
  const token = bffBearerToken
  if (!token) return fetchWithTimeout(input, init)

  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${token}`)

  const response = await fetchWithTimeout(input, { ...init, headers })

  // BFF serves requests without a JWT but 401s an invalid one (expired, or issued by the other env's orderbook).
  return response.status === 401 ? fetchWithTimeout(input, init) : response
}

export function setBffBearerToken(token: string | null): void {
  bffBearerToken = token
}
