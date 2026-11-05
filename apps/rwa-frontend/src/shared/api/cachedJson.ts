import 'server-only'

import { normalizeError } from '@cowprotocol/common-utils/errors'

import { unstable_cache } from 'next/cache'

export type CachedJsonFetcher = (url: string, revalidate: number, allowNotFound: boolean) => Promise<unknown>

/** `null` when the upstream answers 404 and `allowNotFound` is set */
export type JsonRequest = (url: string, allowNotFound: boolean) => Promise<unknown>

interface CachedResponse {
  body: unknown
  fetchedAt: number
}

/**
 * Next serves an expired entry once before refreshing it, however old it is, so an entry
 * older than this many `revalidate` periods is refetched before it is served
 */
const MAX_ENTRY_AGE_REVALIDATIONS = 2

/**
 * Data cache entry per URL. A failed refresh keeps serving the stale entry, so `request` should space out
 * upstream attempts with `withRetryBackoff`. Bump `cacheKey` when a cached payload changes shape:
 * the data cache outlives deployments
 */
export function createCachedJsonFetcher(cacheKey: string[], request: JsonRequest): CachedJsonFetcher {
  const cachedRequests = new Map<number, (url: string, allowNotFound: boolean) => Promise<CachedResponse>>()

  return async (url, revalidate, allowNotFound) => {
    let load = cachedRequests.get(revalidate)

    if (!load) {
      load = unstable_cache(
        async (cacheUrl: string, cacheAllowNotFound: boolean): Promise<CachedResponse> => ({
          body: await request(cacheUrl, cacheAllowNotFound),
          fetchedAt: Date.now(),
        }),
        cacheKey,
        { revalidate },
      )
      cachedRequests.set(revalidate, load)
    }

    const cached = await load(url, allowNotFound)

    if (Date.now() - cached.fetchedAt <= revalidate * MAX_ENTRY_AGE_REVALIDATIONS * 1000) return cached.body

    try {
      return await request(url, allowNotFound)
    } catch (err: unknown) {
      const error = normalizeError(err)
      console.warn(`[rwa] Serving a stale response of ${url}`, error)

      return cached.body
    }
  }
}
