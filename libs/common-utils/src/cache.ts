import QuickLRU from 'quick-lru'

export interface GetAndCacheParams<T> {
  key: string
  fetch: () => Promise<T>
  cache: QuickLRU<string, Promise<T>>
}

export async function fetchWithCache<T>({ key, fetch, cache }: GetAndCacheParams<T>): Promise<T> {
  const cached = cache.get(key)
  if (cached) {
    return cached
  }

  const resultPromise = fetch()
  cache.set(key, resultPromise)

  return resultPromise
}
